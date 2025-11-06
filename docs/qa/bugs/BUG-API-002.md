# Bug Report: BUG-API-002

**Bug ID:** BUG-API-002  
**Title:** User API crashes on invalid festival IDs - no error response sent  
**Reported By:** Zach Talmadge  
**Date Reported:** 11/06/2025  
**Environment:**
- **Server:** Node.js Express backend
- **Database:** MongoDB/Mongoose

**Severity:** Critical  
**Priority:** P0 (Blocks release)  
**Category:** API - Error Handling, Server Stability  
**Module/Feature:** User API (Schedule Management)

---

## Description

The User API endpoints for adding and removing festivals from a user's schedule (`PUT /user/:festivalID` and `DELETE /user/:festivalID`) crash when receiving invalid or non-existent festival IDs. The server fails to send any response, causing client requests to hang until timeout.

This is a **critical server stability issue** that:
- Causes unhandled exceptions in the Node.js process
- Prevents proper error feedback to clients
- Results in 30-second timeouts for clients
- Could cause server instability under load

**Root Cause:** Missing try-catch blocks and null validation in async operations.

---

## Steps to Reproduce

### **Scenario 1: Invalid ObjectId Format**

1. Start the server
2. Send PUT request with malformed ObjectId: `PUT /user/invalid-id-123`
3. Observe the response (or lack thereof)

**Test Code:**
```javascript
await request(app)
  .put('/user/invalid-id-123')
  .expect(400);
```

**Manual Test:**
```bash
curl -X PUT http://localhost:3000/user/invalid-id-123 -v
```

---

### **Scenario 2: Valid ObjectId Format, Non-Existent Festival**

1. Start the server
2. Generate valid but non-existent ObjectId: `507f1f77bcf86cd799439011`
3. Send PUT request: `PUT /user/507f1f77bcf86cd799439011`
4. Observe the response

**Test Code:**
```javascript
const fakeId = new mongoose.Types.ObjectId();
await request(app)
  .put(`/user/${fakeId}`)
  .expect(400);
```

---

### **Scenario 3: DELETE with Invalid ID (Same Issue)**

Same behavior occurs with DELETE requests:
```bash
curl -X DELETE http://localhost:3000/user/invalid-id-123 -v
```

---

## Expected Result

**Status Code:** 400 Bad Request  
**Response Time:** < 100ms  
**Response Body:**
```json
{
  "error": "Invalid festival ID format"
}
```

**OR** (for valid ObjectId format but non-existent):
```json
{
  "error": "Festival not found"
}
```

**Server Behavior:**
- No crash or unhandled exception
- Proper error logged to console
- Response sent immediately
- Server continues handling subsequent requests

---

## Actual Result

**Status Code:** No response (connection hangs)  
**Response Time:** Timeout after 30 seconds  
**Response Body:** Empty

**Server Behavior:**
```
* Empty reply from server
curl: (52) Empty reply from server
```

**Console Output:**
```
CastError: Cast to ObjectId failed for value "invalid-id-123" (type string) at path "_id"
```

**Request Timeline:**
```
0ms:    Client sends request
1ms:    Server receives request
2ms:    Mongoose throws CastError (unhandled)
2ms:    Request handler crashes
30000ms: Client timeout
```

---

## Impact Analysis

### **Severity Justification (Critical):**

**Why Critical:**
- **Server Crashes:** Unhandled exceptions in async code
- **No Error Response:** Clients receive no feedback
- **User Experience:** 30-second hangs are unacceptable
- **Cascading Failures:** Multiple failed requests could destabilize server
- **Production Risk:** Would cause immediate user complaints

**This is NOT a minor bug** - it's a fundamental error handling failure.

---

### **Affected Endpoints:**

Confirmed affected (6 failure scenarios):
- ✅ `PUT /user/:festivalID` with invalid ObjectId format
- ✅ `PUT /user/:festivalID` with non-existent festival
- ✅ `DELETE /user/:festivalID` with invalid ObjectId format
- ✅ `DELETE /user/:festivalID` with non-existent festival

Potentially affected (needs verification):
- ⚠️ Any endpoint using `findOne({_id: req.params.id})` without try-catch
- ⚠️ `GET /artists/:id` (different issue - see BUG-API-001)
- ⚠️ `GET /festivals/:id` (different issue - see BUG-API-001)

---

### **User Impact:**

**Frontend Developers:**
- Requests hang for 30 seconds
- Impossible to implement proper error handling
- Poor user experience (loading spinners never stop)

**End Users:**
- App appears frozen
- No error messages or feedback
- Frustration and potential app abandonment

**Operations:**
- Server logs show unhandled exceptions
- Potential memory leaks from hanging connections
- Difficult to monitor and debug

---

### **Test Impact:**

**Test Execution Time:**
- **Before Fix:** 183 seconds (6 tests × 30s timeout each + 19 passing tests)
- **After Fix:** ~8-10 seconds (all tests pass quickly)

**Tests that revealed this bug:**
1. `should return 400 for invalid festival ID` (PUT)
2. `should return 400 for non-existent festival ID` (PUT)
3. `should return 400 for invalid festival ID` (DELETE)
4. `should return 400 for non-existent festival ID` (DELETE)
5. `should handle malformed ObjectId in PUT request`
6. `should handle malformed ObjectId in DELETE request`

All 6 tests timed out at exactly 30 seconds (Jest default timeout).

---

## Root Cause Analysis

### **File:** `server/src/user/user.controller.js`

### **Issue 1: Missing Try-Catch in addUserEvent**

**Problematic Code:**
```javascript
exports.addUserEvent = async (req, res) => {
    // ❌ NO TRY-CATCH!
    const [ user, festival ] = await Promise.all([
        User.findOne(),
        Festivals.findOne({_id: req.params.festivalID})
    ])
    // If req.params.festivalID is invalid, Mongoose throws CastError
    // Error is UNHANDLED → crashes request handler
    
    user.events.push(festival)  // ❌ No null check - crashes if festival is null
    festival.added = true       // ❌ TypeError if festival is null
    
    // Promise chain for saving (also problematic)
    festival.save().then(() => { ... })
}
```

**What Happens:**
1. Invalid ObjectId format → Mongoose throws `CastError`
2. No try-catch to handle error
3. Error propagates up, crashes request handler
4. No response ever sent to client
5. Client waits until timeout (30 seconds)

---

### **Issue 2: Missing Try-Catch in deleteUserEvent**

**Same pattern in DELETE:**
```javascript
exports.deleteUserEvent = async (req, res) => {
    // ❌ NO TRY-CATCH!
    const [ user, festival ] = await Promise.all([
        User.findOne(),
        Festivals.findOne({_id: req.params.festivalID})
    ])
    
    festival.added = false  // ❌ Crashes if festival is null
    // ... rest of code
}
```

---

### **Issue 3: No Null Validation**

Even if the ObjectId **format** is valid but the festival doesn't exist:
```javascript
const festival = await Festivals.findOne({_id: validButNonExistentId})
// festival is now NULL

festival.added = true  // ❌ TypeError: Cannot set property 'added' of null
```

**MongoDB behavior:**
- `findOne()` returns `null` when no document matches
- `null` is NOT an error - it's a valid result
- Code must explicitly check for null

---

### **Issue 4: Mixed Async Patterns**

Code mixes `async/await` with `.then()` chains:
```javascript
exports.addUserEvent = async (req, res) => {
    const [ user, festival ] = await ...  // async/await
    
    festival.save()
        .then(() => {                      // .then() chain
            user.save()
                .then(() => { ... })       // nested .then()
        })
}
```

**Problems:**
- Inconsistent error handling
- Harder to maintain
- Easy to miss error cases

---

## Technical Explanation

### **Why Mongoose Throws CastError:**
```javascript
// Invalid ObjectId format: "invalid-id-123"
Festivals.findOne({_id: "invalid-id-123"})

// Mongoose tries to cast "invalid-id-123" to ObjectId
// ObjectId requires: 12 bytes OR 24 hex characters
// "invalid-id-123" is neither
// Mongoose throws: CastError
```

**Error Details:**
```
CastError: Cast to ObjectId failed for value "invalid-id-123" (type string) at path "_id"
```

---

### **Why Server Sends No Response:**
```javascript
// Normal flow:
try {
  // do work
  res.json(data)  // ← Response sent
} catch(e) {
  res.status(400).json({error})  // ← Response sent
}

// Broken flow (current code):
const data = await operation()  // ← Throws error
// No try-catch, so error propagates
// Function exits without sending response
// Client hangs waiting
```

---

## Suggested Fix

### **Option 1: Add Try-Catch and Null Checks (Implemented)**
```javascript
exports.addUserEvent = async (req, res) => {
    try {
        // Fetch user and festival
        const [ user, festival ] = await Promise.all([
            User.findOne(),
            Festivals.findOne({_id: req.params.festivalID})
        ])
        
        // Validate user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        // Validate festival exists
        if (!festival) {
            return res.status(400).json({ error: 'Festival not found' })
        }
        
        // Safe to proceed - both exist
        user.events.push(festival)
        festival.added = true
        
        // Use async/await instead of .then() chains
        await festival.save()
        await user.save()
        
        res.sendStatus(200)
        
    } catch(e) {
        console.log(e)
        
        // Handle invalid ObjectId format specifically
        if (e.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid festival ID format' })
        }
        
        // Generic error fallback
        res.status(400).json({ error: 'Failed to add festival to schedule' })
    }
}
```

**Key Improvements:**
1. ✅ Everything wrapped in try-catch
2. ✅ Null checks before using `festival` or `user`
3. ✅ Specific error for `CastError` (invalid ObjectId)
4. ✅ Generic error fallback
5. ✅ Consistent async/await (no .then() chains)
6. ✅ Always sends a response

---

### **Option 2: Use Mongoose Validation Middleware**
```javascript
// Add custom validation in routes
router.put('/user/:festivalID', 
    validateObjectId('festivalID'),  // Middleware to check ID format
    userController.addUserEvent
)

// Middleware function:
function validateObjectId(paramName) {
    return (req, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
            return res.status(400).json({ error: 'Invalid ID format' })
        }
        next()
    }
}
```

**Pros:** Centralizes validation  
**Cons:** Still need null checks in controller

---

### **Option 3: Use Mongoose .orFail()**
```javascript
const festival = await Festivals.findOne({_id: req.params.festivalID})
    .orFail(new Error('Festival not found'))
```

**Pros:** Throws error if not found  
**Cons:** Still need try-catch wrapper

---

## Resolution

**Fix Applied:** Option 1 (Try-Catch + Null Checks + Async/Await)

**Files Modified:**
- `server/src/user/user.controller.js`

**Changes Made:**
1. Wrapped all async logic in try-catch blocks
2. Added null validation for `user` and `festival`
3. Added specific error handling for `CastError`
4. Converted `.then()` chains to `async/await`
5. Ensured response always sent (no hanging requests)

**Test Results After Fix:**
```
✅ All 24 User API tests passing
✅ Execution time: ~8-10 seconds (down from 183 seconds)
✅ Server no longer crashes on invalid inputs
✅ Proper 400 error responses with descriptive messages
```

---

## Verification Steps

### **Manual Verification:**

**1. Test Invalid ObjectId (PUT):**
```bash
curl -X PUT http://localhost:3000/user/invalid-id-123
# Expected: {"error":"Invalid festival ID format"}
# Status: 400
```

**2. Test Non-Existent Festival (PUT):**
```bash
curl -X PUT http://localhost:3000/user/507f1f77bcf86cd799439011
# Expected: {"error":"Festival not found"}
# Status: 400
```

**3. Test Invalid ObjectId (DELETE):**
```bash
curl -X DELETE http://localhost:3000/user/invalid-id-123
# Expected: {"error":"Invalid festival ID format"}
# Status: 400
```

**4. Test Non-Existent Festival (DELETE):**
```bash
curl -X DELETE http://localhost:3000/user/507f1f77bcf86cd799439011
# Expected: {"error":"Festival not found"}
# Status: 400
```

---

### **Automated Test Verification:**
```bash
npm test user.integration.test
```

**Expected Results:**
```
✅ should return 400 for invalid festival ID (PUT)
✅ should return 400 for non-existent festival ID (PUT)
✅ should return 400 for invalid festival ID (DELETE)
✅ should return 400 for non-existent festival ID (DELETE)
✅ should handle malformed ObjectId in PUT request
✅ should handle malformed ObjectId in DELETE request
```

---

## Related Issues

**Related Bugs:**
- **BUG-API-001:** GET /artists/:id returns 200 instead of 404 (similar pattern, lower severity)
- **Potential:** GET /festivals/:id likely has same issue as BUG-API-001

**Pattern Identified:**
All endpoints that accept ID parameters need:
1. Try-catch around database operations
2. Validation of ID format
3. Null checks after queries
4. Proper error responses

**Recommended Action:**
Audit all endpoints accepting ID parameters for similar issues.

---

## Lessons Learned

### **For Future Development:**

**1. Always Wrap Async Operations in Try-Catch**
```javascript
// ✅ GOOD
exports.handler = async (req, res) => {
    try {
        const data = await Model.findOne({...})
        // handle data
    } catch(e) {
        // handle error
    }
}

// ❌ BAD
exports.handler = async (req, res) => {
    const data = await Model.findOne({...})  // Unhandled if throws
    // handle data
}
```

---

**2. Always Check for Null After Database Queries**
```javascript
// ✅ GOOD
const record = await Model.findOne({_id: id})
if (!record) {
    return res.status(404).json({ error: 'Not found' })
}
// safe to use record

// ❌ BAD
const record = await Model.findOne({_id: id})
record.property = value  // Crashes if record is null
```

---

**3. Handle CastError Explicitly**
```javascript
catch(e) {
    if (e.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format' })
    }
    // other errors
}
```

---

**4. Be Consistent with Async Patterns**
```javascript
// ✅ GOOD - Pure async/await
await model1.save()
await model2.save()

// ❌ BAD - Mixed patterns
await model1.findOne()
model2.save().then(() => { ... })
```

---

**5. Always Send a Response**
Every code path must send a response:
```javascript
if (error) {
    return res.status(400).json({error})  // ← return stops execution
}
res.json(data)  // ← success response
```

---

## Status

**Current Status:** ✅ Resolved  
**Date Resolved:** 11/06/2025  
**Resolution:** Fixed in code, verified by tests  
**Fixed By:** Zach Talmadge  
**Verified By:** Automated test suite (24/24 passing)

---

## Metrics

**Before Fix:**
- Test Execution Time: 183 seconds
- Passing Tests: 19/24 (79%)
- Failing Tests: 6 (timeout errors)
- Server Stability: Crashes on invalid input

**After Fix:**
- Test Execution Time: ~8-10 seconds (95% improvement)
- Passing Tests: 24/24 (100%)
- Failing Tests: 0
- Server Stability: Handles all error cases gracefully

---

**End of Bug Report**