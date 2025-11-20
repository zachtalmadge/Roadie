# BUG-UI-004: ArtistForm Missing Network Error Handling

**Status:** Open  
**Severity:** High  
**Priority:** High  
**Component:** ArtistForm  
**Discovered:** 2024-11-18  
**Discovered By:** Zach (QA Testing - E2E Test Failure)  
**Related Test:** `cypress/e2e/journeys/create-artist.cy.js`  
**Related Issues:** BUG-UI-001 (EventCard has same issue)

---

## Description

The ArtistForm component does not handle network failures during form submission. When a network error occurs (no internet, server down, DNS failure), the fetch promise rejects but is not caught, causing an unhandled promise rejection. No error feedback is shown to the user.

---

## Steps to Reproduce

1. Navigate to `/addArtist`
2. Fill out complete form with valid data
3. Disconnect from internet OR stop backend server
4. Click Submit button
5. Observe: No error message, no feedback
6. Check console: Unhandled promise rejection

**Expected:** Error modal displays "Network error, please try again"  
**Actual:** Silent failure, user left confused

---

## Impact

- **User Experience:** Critical - Users don't know submission failed
- **Data Loss:** High - User loses form data with no warning
- **User Trust:** High - App appears broken, no feedback
- **Frequency:** Medium - Happens with poor connectivity, server issues

---

## Root Cause

**File:** `client/src/components/ArtistForm/ArtistForm.js`

### No Try-Catch Around Fetch

```javascript
const submit = async e => {
    e.preventDefault()
    let data = { /* ... */ }
    
    // ❌ NO ERROR HANDLING
    let response = await fetch('http://localhost:3000/artists', {
        method: "POST", 
        body, 
        headers
    })
    
    if (response.status === 200) {
        // success
    } else {
        // HTTP errors
    }
}
```

### Why Network Errors Aren't Caught

**Fetch behavior:**
```javascript
// HTTP errors (400, 500) → Promise RESOLVES, check response.status
await fetch(url) // Returns response object

// Network errors (no internet, timeout) → Promise REJECTS
await fetch(url) // Throws error - MUST be caught!
```

**Current code only handles HTTP status codes, not network failures.**

---

## Proposed Fix

Wrap fetch in try-catch:

```javascript
const submit = async e => {
    e.preventDefault()
    let data = { /* ... */ }
    const body = JSON.stringify(data)
    const headers = {"Content-type": "application/json"}
    
    try {
        let response = await fetch('http://localhost:3000/artists', {
            method: "POST", 
            body, 
            headers
        })
        
        if (response.status === 200) {
            setSuccess(true)
            handleShow()
            resetFormValues()
        } else {
            setSuccess(false)
            handleShow()
        }
    } catch (error) {
        // Network error (no internet, server down, timeout)
        console.error('Network error:', error)
        setSuccess(false)
        handleShow()
    }
}
```

---

## Examples of Network Errors

**Errors that are NOT caught currently:**
1. No internet connection
2. Backend server not running
3. DNS resolution failure
4. Request timeout
5. SSL/TLS certificate errors
6. CORS errors (in some cases)

**All result in:** Silent failure, no user feedback

---

## Test Coverage

E2E test documents the bug:
```javascript
it('should handle network failure gracefully', () => {
    cy.intercept('POST', '**/artists', { forceNetworkError: true })
    
    // Fill and submit form
    cy.contains('button', 'Submit').click()
    
    // Expects: Error modal appears
    // Currently: FAILS (no error handling)
});
```

---

## Related Issues

- **BUG-UI-001:** EventCard has identical issue (missing network error handling)
- **EventForm:** Likely has same issue (needs testing)

**Pattern:** All components using fetch likely affected

---

## Prevention Strategy

**Create shared API utility:**
```javascript
// utils/api.js
export const safeFetch = async (url, options) => {
    try {
        const response = await fetch(url, options);
        return { response, error: null };
    } catch (error) {
        return { response: null, error };
    }
};

// Usage:
const { response, error } = await safeFetch(url, options);
if (error) {
    // Handle network error
} else if (response.ok) {
    // Success
} else {
    // HTTP error
}
```

---

## Severity Justification

**High Severity because:**
- User receives no feedback (bad UX)
- Data loss potential (user thinks submission worked)
- Common occurrence (poor network, server restarts)
- Easy to fix (add try-catch)
- Affects user trust in application

---

**Last Updated:** 2024-11-18