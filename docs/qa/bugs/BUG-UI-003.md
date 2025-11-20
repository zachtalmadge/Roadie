# BUG-UI-003: ArtistForm Accepts Whitespace-Only Input in Required Fields

**Status:** Open  
**Severity:** Medium  
**Priority:** Medium  
**Component:** ArtistForm  
**Discovered:** 2024-11-18  
**Discovered By:** Zach (QA Testing - E2E Test Failure)  
**Related Test:** `cypress/e2e/journeys/create-artist.cy.js`

---

## Description

The ArtistForm component accepts and submits form data when required fields contain only whitespace characters (spaces, tabs). This allows creation of artist records with empty/meaningless data.

---

## Steps to Reproduce

1. Navigate to `/addArtist`
2. In required fields, type only spaces: `   `
3. Click Submit
4. Observe success modal appears
5. Check database - artist created with whitespace values

**Expected:** Form validation rejects whitespace-only input  
**Actual:** Form submits successfully with invalid data

---

## Impact

- **Data Integrity:** High - Pollutes database with meaningless records
- **User Experience:** High - Blank artist cards in UI
- **Search/Filter:** Broken for whitespace records

---

## Root Cause

HTML5 `required` attribute only checks non-empty, not meaningful content:

```javascript
// HTML5 accepts:
"   "      // Whitespace only - PASSES ❌
""         // Empty string - FAILS ✅

// Component doesn't trim or validate:
const submit = async e => {
    let data = {
        name: nameProp.value,  // ❌ No trimming
        // ...
    }
}
```

---

## Proposed Fix

Add client-side validation with trimming:

```javascript
const submit = async e => {
    e.preventDefault()
    
    // Trim and validate
    const trimmedName = nameProp.value.trim();
    if (!trimmedName) {
        alert('Name cannot be empty or only spaces');
        return;
    }
    
    let data = {
        name: trimmedName,
        // ...
    }
}
```

---

## Test Coverage

E2E test documents the bug:
```javascript
it('should not allow submission with only whitespace', () => {
    // Test fills all fields with spaces
    // Expects: Success modal should NOT appear
    // Currently: FAILS (bug exists)
});
```

---

**Last Updated:** 2024-11-18