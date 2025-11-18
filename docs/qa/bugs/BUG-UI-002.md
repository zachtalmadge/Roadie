# BUG-UI-002: Camping Radio Button Selection Not Captured Correctly

**Status:** Fixed  
**Severity:** Medium  
**Priority:** High  
**Component:** EventForm  
**Discovered:** 2024-11-17  
**Discovered By:** Zach (QA Testing - Automated Test Failure)  
**Fixed:** 2024-11-17  
**Fixed By:** Zach

---

## Description

When users select the "None" camping radio button in the EventForm, the form submission still sends `camping: "true"` instead of `camping: "false"`. The radio button selection for the "false" value is not properly captured during form submission.

---

## Steps to Reproduce

1. Navigate to Create Event form (`/createEvent`)
2. Fill in all required fields
3. Select the **"None"** radio button for the Camping option
4. Submit the form
5. Check the API payload sent to `/festivals`

**Expected:** `camping: "false"`  
**Actual:** `camping: "true"`

---

## Impact

**User Impact:** Medium-High
- Users selecting "None" for camping have their choice ignored
- Event data is incorrectly stored as camping-available when it's not
- Affects search/filter functionality if filtering by camping availability

**Data Integrity:** Medium
- Incorrect boolean value stored in database
- Affects downstream features relying on accurate camping data

**Frequency:** 100% reproducible when "None" is selected

---

## Root Cause

**File:** `client/src/components/EventForm/EventForm.js`  
**Line:** ~52 (submit handler)

### Technical Analysis

The original code used:
```javascript
camping: e.target.elements.camping.value
```

**Problem:** When multiple radio buttons share the same `name` attribute, `e.target.elements.camping` returns a **RadioNodeList** (an array-like collection of all radio buttons with that name). Accessing `.value` on a RadioNodeList returns the `value` of the **first element in the collection**, not the checked element.

### Why the Bug Occurred

**HTML Structure:**
```jsx
<Form.Check type="radio" name="camping" label="Yes" value="true"/>
<Form.Check type="radio" name="camping" label="None" value="false"/>
```

**JavaScript Behavior:**
- `e.target.elements.camping` → RadioNodeList [radio1, radio2]
- `e.target.elements.camping.value` → Always returns `radio1.value` ("true")
- No check for which radio button is actually selected (`.checked`)

**Result:** Regardless of user selection, the form always submits the first radio button's value.

---

## How It Was Discovered

**Discovery Method:** Automated testing with React Testing Library

**Failing Test:**
```javascript
test('handles camping radio button value correctly (false)', async () => {
  // ... fill form and select "None" radio button
  
  const sentData = JSON.parse(callArgs[1].body);
  expect(sentData.camping).toBe('false'); // FAILED - received "true"
});
```

**Test Failure Output:**
```
expect(received).toBe(expected)

Expected: "false"
Received: "true"
```

**Analysis:** The "true" test passed coincidentally because "Yes" is the first radio button, masking the bug. Only when testing "false" did the issue become apparent.

---

## The Fix

**Solution Implemented:** Use `FormData` API to get the checked radio button value

### Code Change

**Before (Broken):**
```javascript
const submit = async e => {
    e.preventDefault()
    let data = {
        // ... other fields
        camping: e.target.elements.camping.value  // ❌ Always returns first radio value
    }
    // ...
}
```

**After (Fixed):**
```javascript
const submit = async e => {
    e.preventDefault()
    let data = {
        // ... other fields
        camping: new FormData(e.target).get('camping')  // ✅ Gets checked radio value
    }
    // ...
}
```

### Why This Fix Works

The `FormData` API:
1. Automatically identifies which radio button is checked
2. Returns the `value` attribute of the checked radio button
3. Properly handles all form input types (text, radio, checkbox, etc.)
4. More reliable and idiomatic for form handling

### Alternative Solutions Considered

**Option A:** Manually find checked radio
```javascript
const campingRadios = e.target.elements.camping;
const campingValue = Array.from(campingRadios).find(r => r.checked)?.value || 'false';
camping: campingValue
```
- More verbose
- Requires optional chaining and fallback value
- Less maintainable

**Option B:** Query document for checked radio
```javascript
camping: document.querySelector('input[name="camping"]:checked').value
```
- Couples form to DOM structure
- Breaks in testing environments
- Not recommended

**FormData was chosen** for its simplicity, reliability, and modern best practices.

---

## Test Coverage

**Test File:** `client/src/components/EventForm/EventForm.test.js`

**Tests Added/Updated:**
1. `handles camping radio button value correctly (true)` - Validates "Yes" selection
2. `handles camping radio button value correctly (false)` - Validates "None" selection
3. `camping radio buttons are mutually exclusive` - Validates radio behavior

**Verification:**
```bash
npm test -- EventForm.test.js

✓ handles camping radio button value correctly (true)
✓ handles camping radio button value correctly (false)
✓ camping radio buttons are mutually exclusive

Tests: 32 passed, 1 skipped, 33 total
```

---

## Prevention Strategy

### For This Codebase

1. **Use FormData API for all form submissions:**
   ```javascript
   const formData = new FormData(e.target);
   const data = Object.fromEntries(formData);
   ```

2. **Test all radio button options:**
   - Don't just test the first option (which may pass accidentally)
   - Test all values to ensure correct selection capture

3. **Add form submission tests:**
   - Every form should have tests validating submitted data structure
   - Test each input type (text, radio, checkbox, select, etc.)

### General Best Practices

**Radio Button Testing Checklist:**
- [ ] Test selecting each radio option individually
- [ ] Verify correct value is submitted for each option
- [ ] Test mutual exclusivity (selecting one deselects others)
- [ ] Test default state (nothing selected)
- [ ] Verify payload matches user selection

**Form Handling Best Practices:**
1. Use `FormData` API for form value extraction
2. Avoid directly accessing `e.target.elements.inputName.value` for radio buttons
3. Always test all branches of conditional form inputs
4. Use controlled components when radio state needs tracking
5. Add integration tests that verify API payload structure

---

## Related Issues

**Similar Patterns in Codebase:**
- None identified (EventForm is the only form with radio buttons currently)

**Related Bugs:**
- None

**Related Concepts:**
- [MDN: RadioNodeList](https://developer.mozilla.org/en-US/docs/Web/API/RadioNodeList)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [React Forms Documentation](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)

---

## Lessons Learned

1. **Testing Reveals Hidden Bugs:** This bug was completely hidden in manual testing because the default/first option worked correctly. Only comprehensive automated testing of all form states revealed it.

2. **Test All Code Paths:** Testing only the "happy path" (first radio button) gave false confidence. Testing the second option revealed the real issue.

3. **Understanding Browser APIs:** RadioNodeList behavior is unintuitive. Modern APIs like FormData are specifically designed to handle these edge cases.

4. **Test-Driven Development Value:** The test failed before the fix, passed after the fix, and will continue to prevent regression. This is TDD in action.

5. **Form Handling Complexity:** Forms have many subtle behaviors. Using standard APIs (FormData) rather than manual element access reduces bugs.

---

## Regression Prevention

**Automated Test:** ✅ In place (`EventForm.test.js`)

**CI/CD:** Tests run on every commit

**Code Review Checklist Addition:**
- [ ] Radio buttons tested for all values
- [ ] FormData used for form value extraction
- [ ] Form submission payload verified in testsgit 

---

## QA Metrics

**Time to Discovery:** During initial test development (~30 minutes after writing tests)  
**Time to Fix:** ~5 minutes (one-line change)  
**Test Execution Time:** ~360ms for camping-related tests  
**Lines of Code Changed:** 1 line  
**Tests Added:** 3 tests (covering true, false, and mutual exclusivity)

---

**Last Updated:** 2024-11-17  
**Bug Report Version:** 1.0