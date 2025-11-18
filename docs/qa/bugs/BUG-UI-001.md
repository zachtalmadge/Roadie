# Bug Report: BUG-UI-001

**Bug ID:** BUG-UI-001  
**Title:** EventCard has no error handling for network failures  
**Reported By:** Zach Talmadge  
**Date Reported:** 11/06/2025  
**Environment:**
- **Component:** EventCard.js (React)
- **Browser:** All browsers

**Severity:** Medium  
**Priority:** P2  
**Category:** UI/UX - Error Handling  
**Module/Feature:** Event Management - Add to Schedule

---

## Description

The EventCard component does not handle network errors when adding events to the user's schedule. When the fetch request fails due to network issues, the user receives no feedback, the button remains enabled, and there's no way to retry the operation.

This creates a poor user experience where failed operations appear to do nothing, leaving users confused about whether their action succeeded.

**Root Cause:** Missing try-catch block around async fetch operation.

---

## Steps to Reproduce

### **Scenario 1: Simulate Network Failure**

1. Open the application
2. Open browser DevTools → Network tab
3. Set network throttling to "Offline"
4. Click "Add to Schedule" button on any event card
5. Observe the result

---

### **Scenario 2: Simulate Server Error**

1. Stop the backend server
2. Click "Add to Schedule" button
3. Observe the result

---

## Expected Result

**When network request fails:**

**Visual Feedback:**
- Error message displays to user (e.g., "Network error. Please try again.")
- OR: Toast/notification appears
- OR: Button shows error state (red color, error icon)

**Button State:**
- Button remains enabled (allowing retry)
- OR: Button shows "Retry" text

**User Action:**
- User can click button again to retry
- User understands what went wrong

**Example:**
```
[Alert/Toast] "Unable to add event. Please check your connection and try again."
[Button remains enabled for retry]
```

---

## Actual Result

**No user feedback:**
- No error message
- No visual indication of failure
- Button remains in normal enabled state
- Modal does not appear
- Nothing happens from user's perspective

**User Experience:**
- User thinks: "Did I click the button?"
- User clicks again (multiple times)
- User gets frustrated
- User doesn't know if action succeeded or failed

**Console:**
```
Unhandled Promise Rejection: Network Error
```

---

## Impact Analysis

### **Severity Justification (Medium):**

**Why Medium:**
- Feature is unusable when network fails
- No user feedback (poor UX)
- User has no way to retry
- Confusion about action outcome

**Not Critical because:**
- Doesn't crash the app
- Works fine when network is stable
- Data integrity not affected
- Can be worked around by refreshing page

---

### **User Impact:**

**Frustration:**
- Users don't know if action succeeded
- No clear error messaging
- No retry mechanism

**Accessibility:**
- Screen reader users get no feedback
- No ARIA live region for error announcements

**Mobile Users:**
- Spotty network connections common
- This issue affects mobile users more frequently

---

### **Frequency:**

**When This Occurs:**
- Intermittent network connectivity
- Server downtime
- API endpoint failures
- Slow network timeouts
- CORS issues (development)

**In production:** Rare but impactful when it happens

---

## Root Cause Analysis

### **File:** `client/src/components/EventCard/EventCard.js`

### **Problematic Code:**
```javascript
// Line ~15-25
const add = async e => {
    const festivalID = e.target.dataset.festival
    
    // ❌ NO TRY-CATCH!
    let response = await fetch(`http://localhost:3000/user/${festivalID}`, {method: "PUT"})
    
    if (response.status === 200) {
        e.target.disabled = true
        handleShow()
    } else {
        alert('something went wrong :((')
    }
    
    // ❌ Network errors (rejected promises) are never caught
}
```

---

### **Why This Happens:**

**Network Errors vs HTTP Errors:**
```javascript
// These are DIFFERENT types of errors:

// 1. HTTP Error (handled by current code)
response.status === 400  // ✅ Caught by if/else

// 2. Network Error (NOT handled by current code)
fetch() throws Error     // ❌ Unhandled promise rejection
```

**fetch() only rejects on network failures:**
- DNS lookup failure
- Connection refused
- Network timeout
- CORS error
- Server unreachable

**fetch() does NOT reject on HTTP errors:**
- 400, 404, 500 status codes are considered "successful" responses
- Current code handles these with if/else

**Problem:** No try-catch to handle rejected promises

---

## Technical Explanation

### **How Promises Work:**
```javascript
// Current code (simplified):
const add = async e => {
    let response = await fetch(url)  // ← If this throws, nothing catches it
    
    if (response.status === 200) {
        // success
    } else {
        // HTTP error (400, 500, etc.)
    }
    
    // ❌ Network errors escape this function
}
```

**What happens on network error:**
1. `fetch()` attempts connection
2. Network failure occurs (no response object)
3. `fetch()` throws Error
4. No try-catch to handle it
5. Promise rejection is unhandled
6. Console warning but no user feedback

---

## Suggested Fixes

### **Option 1: Add Try-Catch (Recommended)**
```javascript
const add = async e => {
    const festivalID = e.target.dataset.festival
    
    try {
        let response = await fetch(`http://localhost:3000/user/${festivalID}`, {
            method: "PUT"
        })
        
        if (response.status === 200) {
            e.target.disabled = true
            handleShow()
        } else {
            alert('Unable to add event. Server returned an error.')
        }
        
    } catch (error) {
        // Network error caught here
        console.error('Network error:', error)
        alert('Network error. Please check your connection and try again.')
    }
}
```

**Pros:**
- ✅ Catches all errors
- ✅ Provides user feedback
- ✅ Simple to implement
- ✅ Allows retry (button stays enabled)

**Cons:**
- ❌ Uses alert() (not great UX)

---

### **Option 2: Add Try-Catch with Better UX**
```javascript
const add = async e => {
    const festivalID = e.target.dataset.festival
    const button = e.target
    
    // Disable button during request
    button.disabled = true
    button.textContent = 'Adding...'
    
    try {
        let response = await fetch(`http://localhost:3000/user/${festivalID}`, {
            method: "PUT"
        })
        
        if (response.status === 200) {
            handleShow()
            // Keep button disabled on success
        } else {
            throw new Error('Server error')
        }
        
    } catch (error) {
        console.error('Error adding event:', error)
        
        // Re-enable button for retry
        button.disabled = false
        button.textContent = 'Add to Schedule'
        
        // Show error (could use toast instead of alert)
        alert('Unable to add event. Please try again.')
    }
}
```

**Pros:**
- ✅ Better loading state
- ✅ Clear retry mechanism
- ✅ Button provides feedback

**Cons:**
- ❌ Still uses alert() (could use toast library)

---

### **Option 3: Add Error State to Component**
```javascript
const EventCard = ({ ... }) => {
    const [show, setShow] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const add = async e => {
        const festivalID = e.target.dataset.festival
        
        setLoading(true)
        setError(null)
        
        try {
            let response = await fetch(`http://localhost:3000/user/${festivalID}`, {
                method: "PUT"
            })
            
            if (response.status === 200) {
                e.target.disabled = true
                handleShow()
            } else {
                setError('Unable to add event. Please try again.')
            }
            
        } catch (error) {
            setError('Network error. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <>
            {error && {error}}
            {/* rest of component */}
            
                {loading ? 'Adding...' : 'Add to Schedule'}
            
        </>
    )
}
```

**Pros:**
- ✅ Best UX
- ✅ Clear error messages
- ✅ Loading state
- ✅ Error displayed inline
- ✅ No alerts

**Cons:**
- ❌ More code changes
- ❌ Requires additional state management

---

## Testing Impact

### **Test Discovery:**

While implementing EventCard component tests, this issue was discovered:
```javascript
it.skip('should handle network error gracefully', async () => {
  // SKIPPED: Component doesn't have try-catch around fetch
  // Network errors result in unhandled promise rejection
  // Recommendation: Add try-catch block around fetch call
});
```

**Test Status:** Skipped (documents known issue)

**To verify fix:** Un-skip test and update expectations

---

## Related Issues

**Similar Pattern in Other Components:**
- ⚠️ ArtistForm (likely has same issue)
- ⚠️ EventForm (likely has same issue)
- ⚠️ Other components making fetch calls

**Recommended Action:**
Audit all components with fetch/axios calls for error handling

---

## User Story

**As a user**  
**I want** clear feedback when my action fails  
**So that** I know what went wrong and can take corrective action  

**Acceptance Criteria:**
- [ ] Network errors display user-friendly message
- [ ] User can retry the action
- [ ] Loading state is shown during request
- [ ] Error message is clear and actionable
- [ ] Screen readers announce errors

---

## Status

**Current Status:** Open  
**Assigned To:** Unassigned  
**Priority:** P2 (Fix before production)  
**Estimated Fix Time:** 30 minutes - 1 hour  

---

## Resolution Notes

[To be filled when bug is resolved]

**Date Resolved:**  
**Resolution:**  
**Fixed By:**  
**Verified By:**  

---

## Lessons Learned

### **For Future Development:**

**1. Always Wrap Async Operations in Try-Catch**
```javascript
// ✅ GOOD
const fetchData = async () => {
    try {
        const response = await fetch(url)
        // handle response
    } catch (error) {
        // handle error
    }
}

// ❌ BAD
const fetchData = async () => {
    const response = await fetch(url)  // Unhandled if network fails
    // handle response
}
```

---

**2. fetch() Behavior is Tricky**
```javascript
// fetch() only rejects on NETWORK errors:
try {
    let response = await fetch(url)
    
    // ✅ Response received (even if 404, 500, etc.)
    if (!response.ok) {
        throw new Error('HTTP Error')
    }
    
} catch (error) {
    // ✅ Network error OR thrown error
}
```

---

**3. Provide User Feedback**
```javascript
// ❌ BAD - Silent failure
catch (error) {
    console.log(error)
}

// ✅ GOOD - User feedback
catch (error) {
    setError('Something went wrong. Please try again.')
    // OR
    showToast('Network error')
}
```

---

**4. Consider Using a Fetch Wrapper**
```javascript
// utils/api.js
export const apiRequest = async (url, options) => {
    try {
        const response = await fetch(url, options)
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        
        return await response.json()
        
    } catch (error) {
        console.error('API Error:', error)
        throw error  // Re-throw for caller to handle
    }
}

// Usage
try {
    await apiRequest('/user/123', { method: 'PUT' })
    // success
} catch (error) {
    // handle error with user feedback
}
```

---

**End of Bug Report**