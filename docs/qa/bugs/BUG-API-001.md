# Bug Report: BUG-API-001

**Bug ID:** BUG-API-001  
**Title:** GET /artists/:id returns 200 instead of 404 for non-existent artist  
**Reported By:** Zach Talmadge  
**Date Reported:** 11/05/2025  
**Environment:**
- **Server:** Node.js Express backend
- **Database:** MongoDB

**Severity:** Medium  
**Priority:** P2  
**Category:** API - Error Handling  
**Module/Feature:** Artists API

---

## Description

When requesting a specific artist by ID that doesn't exist in the database, the API returns HTTP 200 (OK) with a null response body instead of returning an appropriate error status code (404 Not Found) with a descriptive error message.

This violates REST API conventions and makes it difficult for clients to distinguish between:
- Success with data (200 + artist object)
- Success with no data (200 + null) ← Current behavior for non-existent artist
- Resource not found (404 + error message) ← Expected behavior

---

## Steps to Reproduce

1. Start the server
2. Create a valid but non-existent MongoDB ObjectId: `507f1f77bcf86cd799439011`
3. Send GET request to: `GET /artists/507f1f77bcf86cd799439011`
4. Observe the response

**Test Code:**
```javascript
// Create a valid ObjectId that doesn't exist
const fakeId = new mongoose.Types.ObjectId();

const response = await request(app)
.get(`/artists/${fakeId}`)
.expect(400);
```

---

## Expected Result

**Status Code:** 404 Not Found  
**Response Body:**
```json
{
  "error": "Artist not found"
}
```

**Reasoning:**
- 404 is the standard HTTP status for "resource not found"
- Error message provides clear feedback to the client
- Follows REST API best practices

---

## Actual Result

**Status Code:** 200 OK  
**Response Body:**
```json
null
```

**Why this happens:**
- `Artists.findOne()` returns `null` when no document matches (not an error)
- Controller sends `res.json(null)` which defaults to 200 status
- No validation to check if artist was found

---

## Test Data Used
```javascript
// Any valid ObjectId that doesn't exist in database
const fakeId = new mongoose.Types.ObjectId(); // e.g., "673a1f2e3b4c5d6e7f8a9b0c"
```

---

## Impact Analysis

**Severity Justification (Medium):**
- Doesn't break core functionality
- Client can still detect missing artist (null response)
- Workaround exists (client checks for null)

**User Impact:**
- Confusing API behavior for frontend developers
- Harder to implement proper error handling on client side
- Inconsistent with REST conventions

**Affected Endpoints:**
- `GET /artists/:id` (confirmed)
- `GET /festivals/:id` (likely has same issue - needs verification)

---

## Root Cause

**File:** `server/src/artists/artists.controller.js`  
**Function:** `artistDetails`
```javascript
exports.artistDetails = async (req, res) => {
   try {
       const artist = await Artists.findOne({_id: req.params.id}, {_id: 0})
       res.json(artist)  // ← Problem: sends null with 200 status
   } catch(e) {
       console.log(e)
       res.status(400).end()
   }
}
```

**Analysis:**
- No validation to check if `artist` is null before responding
- Missing explicit error handling for "not found" scenario

---

## Suggested Fix

**Option 1: Add null check (Recommended)**
```javascript
exports.artistDetails = async (req, res) => {
   try {
       const artist = await Artists.findOne({_id: req.params.id}, {_id: 0})
       
       // Add this check
       if (!artist) {
           return res.status(404).json({ error: 'Artist not found' });
       }
       
       res.json(artist)
   } catch(e) {
       console.log(e)
       res.status(400).json({ error: 'Invalid artist ID' })
   }
}
```

**Option 2: Use Mongoose findById with orFail()**
```javascript
exports.artistDetails = async (req, res) => {
   try {
       const artist = await Artists.findById(req.params.id)
           .select('-_id')
           .orFail(); // Throws error if not found
       
       res.json(artist)
   } catch(e) {
       if (e.name === 'DocumentNotFoundError') {
           return res.status(404).json({ error: 'Artist not found' });
       }
       res.status(400).json({ error: 'Invalid artist ID' })
   }
}
```

---

## Testing Impact

**Test that revealed this bug:**
```javascript
it('should return 404 for non-existent artist ID', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  
  const response = await request(app)
    .get(`/artists/${fakeId}`)
    .expect(404); // Expected 404, got 200
});
```

**Temporary workaround in tests:**
Test updated to match current behavior (expects 200 with null body) until bug is fixed.

---

## Related Issues

- **BUG-API-002:** `GET /festivals/:id` likely has the same issue (needs verification)
- **Enhancement:** All API endpoints should return consistent error format

---

## Status

**Current Status:** Open  
**Assigned To:** Unassigned  
**Priority:** P2 (Fix before production deployment)

---

## Resolution Notes

[To be filled when bug is resolved]

**Date Resolved:**  
**Resolution:**  
**Fixed By:**  
**Commit:**  
**Verified By:**

---

**End of Bug Report**