# Bug Report Template - Roadie

**Version:** 1.0  
**Date:** October 27, 2025  
**Project:** Roadie - Music Festival Discovery App

---

## How to Use This Template

This template provides a standardized format for reporting defects found during testing. Consistent bug reports help ensure issues are clearly communicated, easily reproduced, and efficiently resolved.

---

## Bug Report Format

### **Bug ID:** BUG-[CATEGORY]-[NUMBER]
**Example:** BUG-FES-001, BUG-API-012, BUG-UI-005

### **Title:** [Concise, descriptive summary]
**Example:** "Festival creation fails when endDate is before startDate"

### **Reported By:** [Your Name]
### **Date Reported:** [MM/DD/YYYY]
### **Environment:**
- **Browser:** [Chrome 118 / Safari 17 / Firefox 119]
- **OS:** [macOS 14.0 / Windows 11 / etc.]
- **Build/Version:** [If applicable]

### **Severity:** [Critical / High / Medium / Low]
**Severity Definitions:**
- **Critical (P0):** Application crash, data loss, security vulnerability, complete feature failure
- **High (P1):** Major functionality broken, significant user impact, no workaround
- **Medium (P2):** Feature partially working, workaround exists, moderate impact
- **Low (P3):** Minor issue, cosmetic problem, minimal impact

### **Priority:** [P0 / P1 / P2 / P3]
**Priority Definitions:**
- **P0:** Fix immediately, blocks testing/release
- **P1:** Fix before release
- **P2:** Fix if time permits before release
- **P3:** Fix in future release

### **Category:** [Functional / UI/UX / Security / Performance / API / Data]

### **Module/Feature:** [Festival Creation / Artist Browsing / Schedule Management / etc.]

---

## **Description:**
[Clear, detailed description of the issue. What is not working as expected?]

**Example:**
"When creating a new festival, if the end date is set to a date before the start date, the form submits successfully and creates the festival in the database with illogical dates. This violates business logic and could confuse users."

---

## **Steps to Reproduce:**
[Numbered steps to reproduce the issue. Be specific and include all necessary details.]

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [etc.]

**Example:**
1. Navigate to "Create Festival" page
2. Fill in the following data:
   - Name: "Test Festival"
   - Venue: "Test Venue"
   - Location: "Test City, CA"
   - Start Date: 2025-08-20
   - End Date: 2025-08-15 (5 days before start date)
   - Headliners: "Artist One"
3. Click "Submit" button
4. Observe the result

---

## **Expected Result:**
[What should happen? What is the correct behavior?]

**Example:**
"The form should NOT submit. A validation error message should appear: 'End date must be on or after start date.' The festival should not be created in the database."

---

## **Actual Result:**
[What actually happened? What went wrong?]

**Example:**
"The form submits successfully. A success message appears. The festival is created in the database with startDate: 2025-08-20 and endDate: 2025-08-15. When viewing the festival in the list, the dates appear incorrect/confusing."

---

## **Test Data Used:**
[Include specific test data if relevant]

**Example:**
```json
{
  "name": "Test Festival",
  "venue": "Test Venue",
  "location": "Test City, CA",
  "startDate": "2025-08-20",
  "endDate": "2025-08-15",
  "headliners": ["Artist One"],
  "camping": false
}
```

---

## **Screenshots/Screen Recording:**
[Attach or link to screenshots, screen recordings, or error messages]

**Example:**
- Screenshot 1: Form with invalid dates before submit
- Screenshot 2: Success message after submission
- Screenshot 3: Festival displayed with incorrect dates in list

[If no screenshots available, write: "No screenshots available"]

---

## **Console Errors/Logs:**
[Include any relevant error messages from browser console or server logs]

**Example:**
```
No errors in console
```

Or:
```
TypeError: Cannot read property 'map' of undefined
    at FestivalList.jsx:42
```

---

## **Additional Context:**
[Any other relevant information: related tickets, workarounds, frequency, impact on users]

**Example:**
"This issue was discovered during validation testing of the Create Festival form. It affects data integrity and could lead to user confusion. Frequency: Reproducible 100% of the time. No workaround exists."

---

## **Suggested Fix (Optional):**
[If you have suggestions for how to fix the issue, include them here]

**Example:**
"Add client-side validation in the form component to compare startDate and endDate before submission. Also add server-side validation in the festivals controller to reject invalid date ranges."

---

## **Status:** [New / In Progress / Fixed / Verified / Closed / Won't Fix]

## **Assigned To:** [Developer Name or Unassigned]

## **Resolution Notes:**
[To be filled when bug is resolved. What was the root cause? What was done to fix it?]

---

---

## Example Bug Reports

Below are three example bug reports demonstrating proper documentation:

---

### **Bug ID:** BUG-FES-001
### **Title:** No validation for endDate before startDate in festival creation

**Reported By:** Zach Talmadge  
**Date Reported:** 10/27/2025  
**Environment:**
- **Browser:** Chrome 118.0
- **OS:** macOS 14.0
- **Build:** v1.0

**Severity:** High  
**Priority:** P1  
**Category:** Functional - Validation  
**Module/Feature:** Festival Creation

**Description:**
When creating a festival, the system does not validate that the end date occurs on or after the start date. This allows users to create festivals with illogical date ranges (end date before start date), which violates business logic and creates confusing data.

**Steps to Reproduce:**
1. Navigate to Create Festival page (`/festivals/create`)
2. Fill in required fields:
   - Name: "Invalid Date Festival"
   - Venue: "Test Venue"
   - Location: "Test City, CA"
   - Start Date: 2025-08-20
   - End Date: 2025-08-15 (5 days BEFORE start date)
   - Headliners: "Test Artist"
3. Click "Submit" button
4. Navigate to Festivals list page
5. Observe the created festival

**Expected Result:**
- Form should display validation error: "End date must be on or after start date"
- Form should NOT submit
- No festival should be created in database

**Actual Result:**
- Form submits successfully
- Success message displays
- Festival is created with invalid date range
- In festival list, dates show as "Aug 20 - Aug 15, 2025" which is confusing

**Test Data Used:**
```json
{
  "name": "Invalid Date Festival",
  "venue": "Test Venue",
  "location": "Test City, CA",
  "startDate": "2025-08-20",
  "endDate": "2025-08-15",
  "headliners": ["Test Artist"]
}
```

**Screenshots:**
- Screenshot 1: Form with invalid dates before submission
- Screenshot 2: Success message after submission
- Screenshot 3: Festival list showing illogical date range

**Console Errors/Logs:**
No errors in browser console or server logs.

**Additional Context:**
This is a critical validation bug. All test cases with invalid date logic (TC-FES-CREATE-005) fail. This should be fixed before deployment as it impacts data integrity.

**Suggested Fix:**
1. Add client-side validation in CreateFestivalForm component:
```javascript
   if (endDate < startDate) {
     setError('End date must be on or after start date');
     return;
   }
```
2. Add server-side validation in festivals controller:
```javascript
   if (new Date(endDate) < new Date(startDate)) {
     return res.status(400).json({ error: 'Invalid date range' });
   }
```

**Status:** New  
**Assigned To:** Unassigned  
**Resolution Notes:** [To be filled]

---

### **Bug ID:** BUG-API-001
### **Title:** API returns generic 400 error without descriptive message

**Reported By:** Zach Talmadge  
**Date Reported:** 10/27/2025  
**Environment:**
- **API:** Node.js/Express backend
- **Database:** MongoDB

**Severity:** Medium  
**Priority:** P2  
**Category:** API - Error Handling  
**Module/Feature:** All API endpoints

**Description:**
When API requests fail (missing required fields, validation errors, etc.), the backend returns a 400 status code but does not include a descriptive error message in the response body. This makes debugging difficult and provides poor user experience.

**Steps to Reproduce:**
1. Send POST request to `/festivals` endpoint with missing required field:
```bash
   curl -X POST http://localhost:5000/festivals \
     -H "Content-Type: application/json" \
     -d '{"venue": "Test Venue", "location": "Test City"}'
```
2. Observe response

**Expected Result:**
Response should include descriptive error:
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "startDate": "Start date is required",
    "endDate": "End date is required",
    "headliners": "At least one headliner is required"
  }
}
```

**Actual Result:**
Response is empty or contains minimal information:
- Status: 400
- Body: (empty)

Console shows error but it's not sent to client.

**Test Data Used:**
```json
{
  "venue": "Test Venue",
  "location": "Test City"
}
```

**Console Errors/Logs:**
Server console shows:
```
ValidationError: Festival validation failed: name: Path `name` is required.
```

But error is only logged, not returned to client.

**Additional Context:**
This affects all POST endpoints (festivals, artists). Frontend cannot display meaningful error messages to users because backend doesn't provide them. Reproducible 100% of the time with invalid data.

**Suggested Fix:**
Update error handling in controllers to return descriptive errors:
```javascript
catch(e) {
  if (e.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(e.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  return res.status(500).json({ error: 'Server error' });
}
```

**Status:** New  
**Assigned To:** Unassigned  
**Resolution Notes:** [To be filled]

---

### **Bug ID:** BUG-UI-001
### **Title:** "Added" button state doesn't update after removing festival from schedule

**Reported By:** Zach Talmadge  
**Date Reported:** 10/27/2025  
**Environment:**
- **Browser:** Chrome 118.0
- **OS:** macOS 14.0

**Severity:** Medium  
**Priority:** P2  
**Category:** UI/UX - State Management  
**Module/Feature:** Schedule Management

**Description:**
When a user removes a festival from their schedule (from My Schedule page) and then navigates back to the Festivals list page, the festival card still shows "Added" button state instead of "Add to Schedule". The database is correctly updated (added flag is false), but the UI doesn't reflect this change.

**Steps to Reproduce:**
1. Navigate to Festivals page
2. Add "Coachella" to schedule (button changes to "Added")
3. Navigate to My Schedule page
4. Remove "Coachella" from schedule using "Remove" button
5. Navigate back to Festivals page
6. Observe "Coachella" festival card button

**Expected Result:**
- Button should show "Add to Schedule" (not added state)
- User should be able to add the festival again

**Actual Result:**
- Button still shows "Added" (disabled)
- User cannot re-add the festival without refreshing page
- After page refresh (F5), button correctly shows "Add to Schedule"

**Test Data Used:**
Any festival can reproduce this issue.

**Screenshots:**
- Screenshot 1: Festival with "Added" state
- Screenshot 2: My Schedule page after removal (festival gone)
- Screenshot 3: Festivals page showing stale "Added" state

**Console Errors/Logs:**
No console errors.

**Additional Context:**
This appears to be a state management issue. The frontend is caching the festival's "added" state and not refetching or updating after removal. Workaround: User can refresh the page to see correct state.

**Suggested Fix:**
1. After successful festival removal, trigger a refetch of festivals data
2. Or update local state to set `added: false` for the removed festival
3. Consider using global state management (Context API or Redux) to keep schedule state synchronized across components

**Status:** New  
**Assigned To:** Unassigned  
**Resolution Notes:** [To be filled]

---

---

## Bug Log Summary

**Total Bugs Reported:** [Number]  
**By Severity:**
- Critical (P0): [Number]
- High (P1): [Number]
- Medium (P2): [Number]
- Low (P3): [Number]

**By Status:**
- New: [Number]
- In Progress: [Number]
- Fixed: [Number]
- Verified: [Number]
- Closed: [Number]
- Won't Fix: [Number]

**By Category:**
- Functional: [Number]
- UI/UX: [Number]
- Security: [Number]
- Performance: [Number]
- API: [Number]
- Data: [Number]

---

## Notes on Bug Management

### When to Report a Bug
- Actual behavior differs from expected behavior
- Functionality is broken or not working as designed
- Security vulnerability discovered
- Performance is unacceptably slow
- UI/UX issue significantly impacts user experience

### When NOT to Report a Bug
- Feature is working as designed (even if you disagree with the design)
- Issue is cosmetic and has no functional impact (unless it affects accessibility)
- Issue cannot be reproduced consistently
- Issue is due to user environment (unless it affects many users)

### Bug Triage Process
1. **Report:** Document the bug using this template
2. **Review:** Assess severity and priority
3. **Assign:** Assign to developer (or self if solo project)
4. **Fix:** Developer implements fix
5. **Verify:** Re-test to confirm resolution
6. **Close:** Mark as closed if verified

### Tips for Effective Bug Reports
- ✅ Be specific and detailed
- ✅ Include exact steps to reproduce
- ✅ Provide evidence (screenshots, logs)
- ✅ Focus on facts, not opinions
- ✅ Suggest fixes when possible
- ✅ Check for duplicates before reporting
- ❌ Don't use vague terms like "doesn't work" or "broken"
- ❌ Don't report multiple issues in one bug report (create separate reports)
- ❌ Don't editorialize or blame

---

**End of Bug Report Template**