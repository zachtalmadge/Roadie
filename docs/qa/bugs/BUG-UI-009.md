# BUG-UI-009: EventForm Fields Unexpectedly Disabled During Invalid Date Entry

**Status:** Open (Needs Investigation)  
**Severity:** Medium  
**Priority:** Medium  
**Component:** EventForm  
**Discovered:** 2024-11-18  
**Discovered By:** Zach (QA Testing - E2E Test Failure)  
**Related Issues:** None (unique to EventForm)

---

## Description

When attempting to test date validation (end date before start date), the EventForm unexpectedly disables input fields, preventing form completion. The Venue field becomes disabled during the test flow, causing Cypress to fail.

---

## Steps to Reproduce

1. Navigate to `/createEvent`
2. Type event name: "Invalid Date Event"
3. Attempt to type in Venue field
4. Observe: Field is disabled, cannot type

**Expected:** All form fields remain editable  
**Actual:** Venue field (and possibly others) is disabled

---

## Test Evidence

```javascript
it('should handle end date before start date')

// Result:
// CypressError: `cy.type()` failed because it targeted a disabled element.
// The element typed into was:
// <input placeholder="Enter Name of Venue" required="" type="text" 
//        id="venue" class="form-control form-control-lg" value="">
// Ensure the element does not have an attribute named `disabled` 
// before typing into it.
```

---

## Possible Causes

**1. Test State Leakage:**
- Previous test may have left the form in a bad state
- Database reset not fully clearing form state

**2. React State Issue:**
- Form state corruption after certain actions
- useInput hook causing unexpected disabled state

**3. Conditional Rendering Logic:**
- Some form logic disabling fields based on conditions
- Validation logic prematurely disabling inputs

**4. Timing/Race Condition:**
- Cypress acting faster than React state updates
- Form not fully rendered when test continues

---

## Investigation Needed

**To diagnose, check:**

1. **Manual Testing:**
   - Navigate to `/createEvent` manually
   - Try to reproduce disabled field
   - Check if issue is test-specific or actual bug

2. **Component Code Review:**
   - Look for `disabled` prop on form fields
   - Check for conditional logic that could disable inputs
   - Review useInput hook for state issues

3. **Test Isolation:**
   - Run this test in isolation (skip others)
   - See if issue persists without other tests running

4. **Browser DevTools:**
   - Inspect element when test fails
   - Check what's setting `disabled` attribute

---

## Current Form Code Analysis

Looking at EventForm.js, there's no obvious `disabled` logic:

```jsx
<Form.Control {...venueProp} size="lg" type="text"
              placeholder="Enter Name of Venue" required />
```

The `disabled` attribute is NOT in the source code, suggesting:
- It's being added dynamically
- Or it's coming from React Bootstrap
- Or there's state corruption

---

## Workaround

For now, this test can be skipped with documentation:

```javascript
it.skip('should handle end date before start date', () => {
    // SKIPPED: BUG-UI-009 - Fields unexpectedly disabled
    // Needs investigation into form state management
});
```

---

## Secondary Issue: No Date Validation

Even if this test passed, EventForm likely **does not validate** that end date is after start date. This is a separate concern:

**Example of invalid data that would be accepted:**
```javascript
{
  startDate: '2025-12-31',  // December
  endDate: '2025-01-01'     // January (BEFORE start)
}
```

**Recommendation:** Add date validation regardless of this test failure.

---

## Related Improvements

**Date Validation to Add:**
```javascript
const submit = async e => {
    e.preventDefault()
    
    if (new Date(endDate) < new Date(startDate)) {
        alert('End date must be after start date');
        return;
    }
    
    // ... continue submission
}
```

---

**Last Updated:** 2024-11-18  
**Status:** Needs manual investigation to determine root cause