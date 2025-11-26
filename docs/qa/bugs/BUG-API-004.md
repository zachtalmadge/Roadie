# Bug Report: BUG-API-012 - Error When Deleting Non-Existent Festival from Schedule

**Bug ID:** BUG-API-012  
**Component:** API - User Endpoint  
**Reported By:** Zach Talmadge  
**Date:** November 25, 2025  
**Severity:** Low  
**Priority:** Medium  
**Status:** Documented  
**Affected Endpoint:** `DELETE /user/:festivalID`  
**Issue Type:** Error Handling / API Design

---

## Summary
When attempting to delete a festival from a user's schedule that was never added, the API returns a 400 error instead of handling the operation gracefully. The `user.events.id().remove()` method throws an error when the festival ID is not found in the events array, resulting in poor error handling and non-idempotent behavior.

---

## Description
DELETE operations should typically be idempotent - calling them multiple times should have the same effect as calling once. However, the current implementation:
- First call (festival exists): 200 success
- Second call (festival already removed): 400 error

This violates REST principles and creates confusion for API consumers.

---

## Steps to Reproduce

1. Create a user and a festival (but don't add festival to schedule)
2. Attempt to delete the festival from user's schedule:
```bash
curl -X DELETE http://localhost:3000/user/FESTIVAL_ID_HERE
```
Response: 400 with `"Failed to remove festival from schedule"`

Expected: 200 success (idempotent operation)

---

## Expected Behavior

**Option A: Idempotent Success (Recommended)**
- Return 200 regardless of whether festival was in schedule
- Message: "Festival removed from schedule" (or no message)
- Same result whether festival was there or not

**Option B: Explicit Not Found**
- Return 404 with message "Festival not in schedule"
- Clear indication of current state
- Non-idempotent but explicit

---

## Actual Behavior
- Returns 400 error with generic message
- `user.events.id(festivalID).remove()` throws error when ID not found
- Error caught by catch block
- Festival "added" flag behavior is inconsistent (may or may not be set to false)

---

## Impact Assessment

**Security Impact:** Low
- No data breach or unauthorized access
- Could be used to probe which festivals are in schedule

**User Impact:** Low to Medium
- Confusing error messages
- Non-idempotent behavior is unexpected
- Frontend needs to handle edge case

**API Design Impact:** Medium
- Violates REST idempotency principle
- Inconsistent error handling
- Poor developer experience

---

## Root Cause Analysis

**Code Analysis:**
```javascript
exports.deleteUserEvent = async (req, res) => {
    try {
        // ... validation ...
        
        festival.added = false;
        await festival.save();
        
        // THIS THROWS ERROR if festival not in events array
        user.events.id(req.params.festivalID).remove();
        await user.save();
        
        res.sendStatus(200);
        
    } catch(e) {
        // Catches the remove() error
        res.status(400).json({ error: 'Failed to remove festival from schedule' })
    }
}
```

**Why does this happen?**
1. `user.events.id(festivalID)` returns `null` if ID not found
2. Calling `.remove()` on `null` throws TypeError
3. Generic catch block returns 400 error
4. No specific handling for "not in array" case

---

## Recommended Solutions

### Solution 1: Check Before Remove (Recommended)
Verify festival exists in array before attempting removal:
```javascript
exports.deleteUserEvent = async (req, res) => {
    try {
        const [ user, festival ] = await Promise.all([
            User.findOne(),
            Festivals.findOne({_id: req.params.festivalID})
        ]);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (!festival) {
            return res.status(400).json({ error: 'Festival not found' });
        }
        
        // CHECK IF FESTIVAL IS IN SCHEDULE
        const festivalInSchedule = user.events.id(req.params.festivalID);
        
        if (festivalInSchedule) {
            // Only remove if it exists
            festivalInSchedule.remove();
            await user.save();
        }
        
        // Always set added flag to false (idempotent)
        festival.added = false;
        await festival.save();
        
        res.sendStatus(200); // Always 200 (idempotent)
        
    } catch(e) {
        console.log(e);
        
        if (e.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid festival ID format' });
        }
        
        res.status(400).json({ error: 'Failed to remove festival from schedule' });
    }
};
```

**Pros:**
- Idempotent behavior (always returns 200)
- No error thrown
- Consistent state management
- Follows REST principles

**Cons:**
- Less explicit about what happened
- Can't distinguish "removed" from "wasn't there"

---

### Solution 2: Use Array Filter Instead
Remove using filter to avoid the id().remove() error:
```javascript
// Remove festival from events array
user.events = user.events.filter(
    event => event._id.toString() !== req.params.festivalID
);
await user.save();

festival.added = false;
await festival.save();

res.sendStatus(200);
```

**Pros:**
- Simple and clear
- No error thrown
- Works whether festival exists or not

**Cons:**
- Replaces entire array (may have performance implications for large arrays)

---

### Solution 3: Return 404 for Non-Existent
Explicitly return 404 if festival not in schedule:
```javascript
const festivalInSchedule = user.events.id(req.params.festivalID);

if (!festivalInSchedule) {
    return res.status(404).json({ 
        error: 'Festival not in schedule' 
    });
}

festivalInSchedule.remove();
await user.save();

festival.added = false;
await festival.save();

res.sendStatus(200);
```

**Pros:**
- Explicit about current state
- Clear error messages
- Easier for client to understand

**Cons:**
- Not idempotent
- Client needs to handle 404
- More complex client logic

---

## Testing Evidence

Test case from `user.security.test.js`:
```javascript
it('should return 400 when trying to remove festival not in schedule', async () => {
    // Festival was never added, try to remove it
    const response = await request(app)
        .delete(`/user/${testFestival1._id}`)
        .expect(400); // Currently returns 400 (bug)

    expect(response.body.error).toBe('Failed to remove festival from schedule');
    
    // Should be 200 for idempotent behavior
});
```

**Result:** Test confirms 400 error is returned (should be 200)

---

## Related Issues
- BUG-API-011: Duplicate festival additions (related data integrity issue)
- Affects error handling consistency across User endpoints

---

## Decision & Next Steps

**Recommendation:** Implement Solution 1 (Check Before Remove)

**Rationale:**
- Provides idempotent DELETE behavior
- Aligns with REST principles
- Simplest fix with no breaking changes
- Consistent with HTTP standards (DELETE should be idempotent)
- No additional client-side logic needed

**Implementation Priority:** Medium
- Not urgent (low security impact)
- Should be addressed for API consistency
- Important for good developer experience

**Implementation Steps:**
1. Add check for festival in events array
2. Only call remove() if exists
3. Always return 200 (idempotent)
4. Update API documentation
5. Add test cases for both scenarios

---

## Additional Considerations

**State Management:**
Current behavior has another issue - the festival's `added` flag is set to `false` even if the operation fails. This is actually done BEFORE the remove() call:
```javascript
festival.added = false;  // This happens first
await festival.save();   // Saves the false flag

user.events.id(req.params.festivalID).remove();  // This throws error
```

So the festival gets marked as "not added" even though the remove failed. This is a data consistency issue that should also be addressed.

---

## Tags
`security-testing` `error-handling` `api-design` `idempotency` `user-api` `low-severity` `rest-principles`