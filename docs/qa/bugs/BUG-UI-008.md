# BUG-UI-008: EventForm Allows Double Submission on Double-Click

**Status:** Open  
**Severity:** Medium  
**Priority:** Medium  
**Component:** EventForm  
**Discovered:** 2024-11-18  
**Discovered By:** Zach (QA Testing - E2E Test Failure)  
**Related Issues:** BUG-UI-005 (ArtistForm has identical issue)

---

## Description

The EventForm submit button can be clicked multiple times during submission, sending duplicate API requests and potentially creating duplicate festival records.

---

## Steps to Reproduce

1. Navigate to `/createEvent`
2. Fill out complete form with valid data
3. Double-click the Submit button quickly
4. Observe: Two API requests sent

**Expected:** Only one request sent, button disabled during submission  
**Actual:** Two requests sent (requestCount = 2)

---

## Test Evidence

```javascript
it('should prevent double submission on double click')

// Result:
// AssertionError: expected 2 to equal 1
// Line 518: expect(requestCount).to.equal(1);
```

The test intercepted 2 POST requests to `/festivals` when only 1 should have been sent.

---

## Root Cause

Same as BUG-UI-005:
- No loading state to track submission
- Submit button not disabled during async operation
- Multiple clicks trigger multiple `submit()` calls

---

## Proposed Fix

Same fix as BUG-UI-005:

```javascript
const [isSubmitting, setIsSubmitting] = useState(false)

const submit = async e => {
    e.preventDefault()
    if (isSubmitting) return;  // Guard clause
    
    setIsSubmitting(true)
    try {
        // ... submission logic
    } finally {
        setIsSubmitting(false)
    }
}

<button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
```

---

## Affected Components

| Component | Bug ID | Status |
|-----------|--------|--------|
| ArtistForm | BUG-UI-005 | Open |
| EventForm | BUG-UI-008 | Open |

**Recommendation:** Create shared SubmitButton component with loading state.

---

**Last Updated:** 2024-11-18