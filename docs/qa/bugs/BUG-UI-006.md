# BUG-UI-006: EventForm Accepts Whitespace-Only Input in Required Fields

**Status:** Open  
**Severity:** Medium  
**Priority:** Medium  
**Component:** EventForm  
**Discovered:** 2024-11-18  
**Discovered By:** Zach (QA Testing - E2E Test Failure)  
**Related Issues:** BUG-UI-003 (ArtistForm has identical issue)

---

## Description

The EventForm component accepts and submits form data when required fields contain only whitespace characters. This is the same issue as BUG-UI-003 in ArtistForm.

---

## Steps to Reproduce

1. Navigate to `/createEvent`
2. Fill required fields with only spaces: `   `
3. Fill dates and select camping option
4. Click Submit
5. Observe: Success modal appears ("Event Added")

**Expected:** Form validation rejects whitespace-only input  
**Actual:** Form submits successfully with invalid data

---

## Test Evidence

```javascript
it('should not allow submission with only whitespace in required fields')

// Result:
// AssertionError: Expected not to find content: 'Event Added' 
// but continuously found it.
```

---

## Root Cause

Same as BUG-UI-003:
- HTML5 `required` attribute only checks non-empty, not meaningful content
- No `.trim()` validation before submission
- Whitespace satisfies `required` check

---

## Proposed Fix

Same fix as BUG-UI-003 - add validation with trimming:

```javascript
const submit = async e => {
    e.preventDefault()
    
    const trimmedName = nameProp.value.trim();
    if (!trimmedName) {
        alert('Event name cannot be empty');
        return;
    }
    // ... validate other fields
}
```

---

## Affected Components

| Component | Bug ID | Status |
|-----------|--------|--------|
| ArtistForm | BUG-UI-003 | Open |
| EventForm | BUG-UI-006 | Open |

**Recommendation:** Fix both forms together using shared validation utility.

---

**Last Updated:** 2024-11-18