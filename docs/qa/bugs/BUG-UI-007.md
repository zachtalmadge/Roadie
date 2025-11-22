# BUG-UI-007: EventForm Missing Network Error Handling

**Status:** Open  
**Severity:** High  
**Priority:** High  
**Component:** EventForm  
**Discovered:** 2024-11-18  
**Discovered By:** Zach (QA Testing - E2E Test Failure)  
**Related Issues:** BUG-UI-004 (ArtistForm has identical issue)

---

## Description

The EventForm component does not handle network failures during form submission. When a network error occurs, an unhandled promise rejection causes the test/application to fail silently with no user feedback.

---

## Steps to Reproduce

1. Navigate to `/createEvent`
2. Fill out complete form with valid data
3. Disconnect from internet OR stop backend server
4. Click Submit
5. Observe: Uncaught TypeError, no error modal shown

**Expected:** Error modal displays "Something went wrong"  
**Actual:** Unhandled promise rejection, silent failure

---

## Test Evidence

```javascript
it('should handle network failure gracefully')

// Result:
// (uncaught exception) TypeError: Failed to fetch
// The following error originated from your application code, 
// not from Cypress. It was caused by an unhandled promise rejection.
```

---

## Root Cause

Same as BUG-UI-004:
- No try-catch around `fetch()` call
- Network errors cause promise rejection
- Rejection not caught, causes unhandled error

```javascript
// Current code (broken):
let response = await fetch(url, options)  // ❌ No try-catch

// Fixed:
try {
    let response = await fetch(url, options)
    // handle response
} catch (error) {
    setSuccess(false)
    handleShow()  // Show error modal
}
```

---

## Affected Components

| Component | Bug ID | Status |
|-----------|--------|--------|
| ArtistForm | BUG-UI-004 | Open |
| EventForm | BUG-UI-007 | Open |

**Recommendation:** Create shared API utility with error handling for all forms.

---

**Last Updated:** 2024-11-18