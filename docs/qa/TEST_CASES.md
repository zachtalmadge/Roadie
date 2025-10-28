# Manual Test Cases - Roadie Music Festival Discovery App

**Version:** 1.0  
**Date:** October 27, 2025  
**Author:** Zach Talmadge  
**Project:** Roadie - Music Festival & Artist Discovery Platform

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Case Template](#2-test-case-template)
3. [Festival Browsing Test Cases](#3-festival-browsing-test-cases)
4. [Festival Creation Test Cases](#4-festival-creation-test-cases)
5. [Artist Browsing Test Cases](#5-artist-browsing-test-cases)
6. [Artist Creation Test Cases](#6-artist-creation-test-cases)
7. [Schedule Management Test Cases](#7-schedule-management-test-cases)
8. [Navigation Test Cases](#8-navigation-test-cases)
9. [Data Validation Test Cases](#9-data-validation-test-cases)
10. [Security Test Cases](#10-security-test-cases)
11. [Usability Test Cases](#11-usability-test-cases)
12. [Cross-Browser Compatibility Test Cases](#12-cross-browser-compatibility-test-cases)
13. [Responsive Design Test Cases](#13-responsive-design-test-cases)
14. [Edge Cases and Error Handling](#14-edge-cases-and-error-handling)

---

## 1. Introduction

### 1.1 Purpose
This document contains a comprehensive repository of manual test cases for the Roadie application. These test cases cover functional, non-functional, positive, negative, and edge case scenarios to ensure thorough testing coverage.

### 1.2 Test Case Conventions

**Test Case ID Format:** `TC-[CATEGORY]-[NUMBER]`
- **TC:** Test Case prefix
- **CATEGORY:** Feature area (FES=Festivals, ART=Artists, SCH=Schedule, NAV=Navigation, etc.)
- **NUMBER:** Sequential number

**Priority Levels:**
- **P0 (Critical):** Must work for app to function
- **P1 (High):** Core functionality, significant user impact
- **P2 (Medium):** Important but has workarounds
- **P3 (Low):** Nice to have, minimal impact

**Test Types:**
- **Functional:** Feature behavior testing
- **UI/UX:** User interface and experience testing
- **Security:** Vulnerability and input validation testing
- **Performance:** Speed and responsiveness testing
- **Compatibility:** Browser and device testing

---

## 2. Test Case TemplateTest Case ID: TC-XXX-001
Test Case Title: [Descriptive title]
Priority: P0/P1/P2/P3
Test Type: Functional/UI/Security/etc.
Prerequisites: [What must be true before test]Test Steps:

[Step 1]
[Step 2]
[Step 3]
Expected Result:
[What should happen]Actual Result:
[To be filled during test execution]Status: Pass/Fail/Blocked/Not Tested
Notes: [Any additional observations]

---

## 3. Festival Browsing Test Cases

### TC-FES-001: View All Festivals
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- Application is running
- Database contains at least 5 festivals

**Test Steps:**
1. Navigate to homepage
2. Click "Festivals" in navigation bar
3. Observe the festivals page

**Expected Result:**
- Festivals page loads successfully
- All festivals are displayed
- Festivals are sorted by start date (earliest first)
- Each festival card shows: name, location, dates, venue

**Status:** Not Tested  
**Notes:**

---

### TC-FES-002: View Empty Festivals List
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- Application is running
- Database contains 0 festivals

**Test Steps:**
1. Navigate to homepage
2. Click "Festivals" in navigation bar
3. Observe the festivals page

**Expected Result:**
- Festivals page loads successfully
- Empty state message is displayed (e.g., "No festivals found" or "Be the first to add a festival!")
- No error occurs

**Status:** Not Tested  
**Notes:**

---

### TC-FES-003: View Festival Details
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- Application is running
- At least one festival exists in database

**Test Steps:**
1. Navigate to Festivals page
2. Click "View Details" button on any festival card
3. Observe the festival details page

**Expected Result:**
- Festival details page loads
- URL changes to `/festivals/[festivalID]`
- All festival information is displayed:
  - Name
  - Venue
  - Location
  - Start date (formatted)
  - End date (formatted)
  - Headliners list
  - Camping availability (if applicable)
  - Attendance (if applicable)
- "Add to Schedule" button is visible (if not already added)

**Status:** Not Tested  
**Notes:**

---

### TC-FES-004: Festival Sorting by Date
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- Database contains festivals with different start dates

**Test Steps:**
1. Navigate to Festivals page
2. Observe the order of festivals displayed

**Expected Result:**
- Festivals are sorted by start date in ascending order (earliest first)
- Past festivals (if any) appear before future festivals
- Single-day and multi-day festivals are sorted correctly

**Status:** Not Tested  
**Notes:**

---

### TC-FES-005: Festival Date Display Format
**Priority:** P2  
**Test Type:** UI/UX

**Prerequisites:** 
- At least one festival exists

**Test Steps:**
1. Navigate to Festivals page
2. Observe date formatting on festival cards

**Expected Result:**
- Dates are displayed in consistent, readable format (e.g., "Jun 15, 2025" or "June 15, 2025")
- Date range is clear (e.g., "Jun 15-17, 2025")
- Single-day festivals show single date appropriately

**Status:** Not Tested  
**Notes:**

---

## 4. Festival Creation Test Cases

### TC-FES-CREATE-001: Create Festival with All Required Fields
**Priority:** P0  
**Test Type:** Functional

**Prerequisites:** 
- Application is running
- User is on Create Festival page

**Test Steps:**
1. Navigate to Create Festival page
2. Fill in all required fields:
   - Name: "Test Music Festival 2025"
   - Venue: "Central Park"
   - Location: "New York, NY"
   - Start Date: "2025-08-15"
   - End Date: "2025-08-17"
   - Headliners: "Artist One, Artist Two, Artist Three"
3. Click "Submit" or "Create Festival" button

**Expected Result:**
- Festival is created successfully
- Success message is displayed
- User is redirected to festivals list or festival details page
- New festival appears in the festivals list
- Festival can be found in database
- "added" flag is set to false by default

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-002: Create Festival with All Fields (Including Optional)
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Fill in all required fields (as in TC-FES-CREATE-001)
2. Fill in optional fields:
   - Camping: Check the checkbox
   - Attendance: "75000"
3. Submit form

**Expected Result:**
- Festival is created with all data
- Optional fields are saved correctly
- Camping shows as "Yes" or true
- Attendance displays correctly

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-003: Create Festival - Missing Required Field (Name)
**Priority:** P0  
**Test Type:** Functional - Negative

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Leave "Name" field empty
2. Fill in all other required fields
3. Click Submit

**Expected Result:**
- Form does NOT submit
- Validation error message appears: "Name is required" or similar
- Error message is displayed near the Name field
- User remains on Create Festival page
- No festival is created in database

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-004: Create Festival - Missing Required Field (Venue)
**Priority:** P0  
**Test Type:** Functional - Negative

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Fill in Name field
2. Leave "Venue" field empty
3. Fill in other required fields
4. Click Submit

**Expected Result:**
- Form does NOT submit
- Validation error: "Venue is required"
- User remains on form
- No festival created

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-005: Create Festival - Invalid Date Logic (End Before Start)
**Priority:** P0  
**Test Type:** Functional - Negative

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Fill in all fields
2. Set Start Date: "2025-08-20"
3. Set End Date: "2025-08-15" (5 days before start)
4. Click Submit

**Expected Result:**
- Form does NOT submit
- Validation error: "End date must be after or equal to start date" or similar
- Error message is clear and actionable
- No festival is created

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-006: Create Single-Day Festival (End Date = Start Date)
**Priority:** P1  
**Test Type:** Functional - Boundary

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Fill in all required fields
2. Set Start Date: "2025-08-15"
3. Set End Date: "2025-08-15" (same day)
4. Click Submit

**Expected Result:**
- Festival is created successfully
- System accepts single-day festivals
- Date displays correctly (e.g., "Aug 15, 2025" not "Aug 15-15, 2025")

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-007: Create Festival - Empty Headliners
**Priority:** P0  
**Test Type:** Functional - Negative

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Fill in all required fields except headliners
2. Leave headliners field empty or blank
3. Click Submit

**Expected Result:**
- Form does NOT submit
- Validation error: "At least one headliner is required" or similar
- No festival is created

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-008: Create Festival - Very Long Festival Name
**Priority:** P2  
**Test Type:** Functional - Boundary

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Enter a very long festival name (200+ characters)
2. Fill in other required fields
3. Submit form

**Expected Result:**
- Either: System accepts long name and stores/displays it correctly
- Or: Validation error indicates maximum length
- If accepted: Name displays properly without breaking UI

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-009: Create Festival - Special Characters in Name
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Enter festival name with special characters: "Rock & Roll Festival '25"
2. Fill in other required fields
3. Submit form

**Expected Result:**
- Festival is created successfully
- Special characters (&, apostrophe) are stored correctly
- Name displays correctly on festival list and details page
- No encoding issues (e.g., &amp; instead of &)

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-010: Create Festival - Duplicate Name
**Priority:** P2  
**Test Type:** Functional - Negative

**Prerequisites:** 
- A festival named "Summer Fest" already exists

**Test Steps:**
1. Navigate to Create Festival page
2. Enter name: "Summer Fest" (exact duplicate)
3. Fill in other fields
4. Submit form

**Expected Result:**
- Either: System allows duplicate (if no unique constraint)
- Or: Error message: "A festival with this name already exists"
- Behavior should be consistent and documented

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-011: Create Festival - Past Date
**Priority:** P3  
**Test Type:** Functional - Business Logic

**Prerequisites:** 
- User is on Create Festival page
- Current date is October 27, 2025

**Test Steps:**
1. Fill in all fields
2. Set Start Date: "2025-05-01" (past date)
3. Set End Date: "2025-05-03"
4. Submit form

**Expected Result:**
- System behavior should be defined:
  - Either: Allows past festivals (for historical records)
  - Or: Shows warning/error: "Festival dates are in the past"
- Behavior is consistent

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-012: Create Festival Form - Submit Button Disabled During Submission
**Priority:** P2  
**Test Type:** UI/UX

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Fill in valid data
2. Click Submit button
3. Observe button state during API call

**Expected Result:**
- Submit button becomes disabled immediately upon click
- Loading indicator appears (spinner, text change to "Creating...")
- User cannot double-click and create duplicate festivals
- Button re-enables after success or error

**Status:** Not Tested  
**Notes:**

---

### TC-FES-CREATE-013: Create Festival - Form Reset After Success
**Priority:** P2  
**Test Type:** UI/UX

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Fill in and submit valid festival data
2. Wait for success message
3. Observe the form fields

**Expected Result:**
- Success message displays
- Form fields are cleared/reset to empty
- User can immediately create another festival without manually clearing fields
- Or: User is redirected away from form

**Status:** Not Tested  
**Notes:**

---

## 5. Artist Browsing Test Cases

### TC-ART-001: View All Artists
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- Database contains at least 5 artists

**Test Steps:**
1. Navigate to homepage
2. Click "Artists" in navigation bar
3. Observe the artists page

**Expected Result:**
- Artists page loads successfully
- All artists are displayed
- Artists are sorted alphabetically by name (A-Z)
- Each artist card shows: name, genre (if available)

**Status:** Not Tested  
**Notes:**

---

### TC-ART-002: View Empty Artists List
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- Database contains 0 artists

**Test Steps:**
1. Navigate to Artists page

**Expected Result:**
- Page loads without error
- Empty state message is displayed
- No artist cards shown

**Status:** Not Tested  
**Notes:**

---

### TC-ART-003: View Artist Details
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- At least one artist exists in database

**Test Steps:**
1. Navigate to Artists page
2. Click "View Details" on any artist card
3. Observe artist details page

**Expected Result:**
- Artist details page loads
- URL changes to `/artists/[artistID]`
- All artist information is displayed:
  - Name
  - Bio (if available)
  - Genre (if available)
  - Label (if available)
  - Albums list (if available)
  - Singles list (if available)

**Status:** Not Tested  
**Notes:**

---

### TC-ART-004: Artist Alphabetical Sorting
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- Database contains artists with names starting with different letters

**Test Steps:**
1. Navigate to Artists page
2. Observe the order of artists

**Expected Result:**
- Artists are sorted alphabetically (A-Z)
- Case-insensitive sorting (e.g., "The Beatles" sorted by "B" not "T")
- Special characters handled consistently

**Status:** Not Tested  
**Notes:**

---

## 6. Artist Creation Test Cases

### TC-ART-CREATE-001: Create Artist with Required Field Only (Name)
**Priority:** P0  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Enter Name: "New Test Artist"
2. Leave all other fields empty
3. Click Submit

**Expected Result:**
- Artist is created successfully
- Success message displays
- Artist appears in artists list
- Optional fields are stored as empty/null

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-002: Create Artist with All Fields
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Fill in all fields:
   - Name: "Complete Artist"
   - Genre: "Rock"
   - Label: "Test Records"
   - Bio: "This is a test artist biography with multiple sentences."
   - Albums: "Album One, Album Two, Album Three"
   - Singles: "Single A, Single B, Single C"
2. Click Submit

**Expected Result:**
- Artist is created with all data
- All fields are saved correctly
- Artist displays correctly in list and details page

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-003: Create Artist - Missing Required Field (Name)
**Priority:** P0  
**Test Type:** Functional - Negative

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Leave Name field empty
2. Fill in other optional fields
3. Click Submit

**Expected Result:**
- Form does NOT submit
- Validation error: "Name is required"
- No artist is created

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-004: Create Artist - Duplicate Name
**Priority:** P0  
**Test Type:** Functional - Negative

**Prerequisites:** 
- An artist named "Duplicate Artist" already exists

**Test Steps:**
1. Navigate to Create Artist page
2. Enter name: "Duplicate Artist" (exact match)
3. Fill in other fields
4. Submit form

**Expected Result:**
- Form submission fails
- Error message: "An artist with this name already exists" or similar
- Database unique constraint is enforced
- No duplicate artist is created

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-005: Create Artist - Empty Name (Whitespace Only)
**Priority:** P1  
**Test Type:** Functional - Negative

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Enter only spaces in Name field: "   "
2. Click Submit

**Expected Result:**
- Form does NOT submit
- Validation error indicates name is required/invalid
- Whitespace is trimmed and treated as empty

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-006: Create Artist - Very Long Bio
**Priority:** P2  
**Test Type:** Functional - Boundary

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Enter name
2. Enter a very long biography (1000+ characters)
3. Submit form

**Expected Result:**
- Either: Long bio is accepted and stored/displayed correctly
- Or: Validation error indicates maximum length
- If accepted: Bio displays properly without breaking UI (may be truncated in list view)

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-007: Create Artist - Multiple Albums/Singles
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Enter name
2. Enter albums: "Album 1, Album 2, Album 3, Album 4, Album 5"
3. Enter singles: "Single 1, Single 2, Single 3"
4. Submit form

**Expected Result:**
- Artist is created
- Albums are parsed and stored as array
- Singles are parsed and stored as array
- Items display correctly on artist details page (as list or comma-separated)

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-008: Create Artist - Empty Albums/Singles Arrays
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Enter name
2. Leave albums and singles fields empty
3. Submit form

**Expected Result:**
- Artist is created successfully
- Albums and singles stored as empty arrays
- Artist details page handles empty arrays gracefully (shows "No albums" or hides section)

**Status:** Not Tested  
**Notes:**

---

### TC-ART-CREATE-009: Create Artist - Special Characters in Name
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Enter artist name with special characters: "AC/DC" or "Panic! At The Disco"
2. Submit form

**Expected Result:**
- Artist is created successfully
- Special characters are stored correctly
- Name displays correctly everywhere
- No encoding issues

**Status:** Not Tested  
**Notes:**

---

## 7. Schedule Management Test Cases

### TC-SCH-001: Add Festival to Schedule from List View
**Priority:** P0  
**Test Type:** Functional

**Prerequisites:** 
- At least one festival exists
- Festival is not already in user's schedule

**Test Steps:**
1. Navigate to Festivals page
2. Click "Add to Schedule" button on a festival card
3. Observe the button state change

**Expected Result:**
- Button text changes to "Added" or similar
- Button becomes disabled or changes appearance
- Festival is added to user's schedule in database
- Festival's "added" flag is set to true

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-002: Add Festival to Schedule from Details Page
**Priority:** P0  
**Test Type:** Functional

**Prerequisites:** 
- User is viewing a festival details page
- Festival is not in schedule

**Test Steps:**
1. Navigate to a festival details page
2. Click "Add to Schedule" button
3. Observe button state

**Expected Result:**
- Button changes to "Added" state
- Festival is added to schedule
- State persists if user refreshes page

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-003: View My Schedule with Festivals
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User has added at least 2 festivals to schedule

**Test Steps:**
1. Navigate to "My Schedule" page from navigation
2. Observe the schedule page

**Expected Result:**
- All scheduled festivals are displayed
- Festivals show same information as on Festivals page
- "Remove from Schedule" button is available on each festival
- Festivals are sorted appropriately (by date recommended)

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-004: View Empty Schedule
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- User has no festivals in schedule

**Test Steps:**
1. Navigate to "My Schedule" page

**Expected Result:**
- Page loads without error
- Empty state message displays (e.g., "Your schedule is empty. Start adding festivals!")
- No festival cards are shown

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-005: Remove Festival from Schedule
**Priority:** P0  
**Test Type:** Functional

**Prerequisites:** 
- User has at least one festival in schedule

**Test Steps:**
1. Navigate to "My Schedule" page
2. Click "Remove" or "Remove from Schedule" button on a festival
3. Observe the change

**Expected Result:**
- Festival is removed from the schedule page
- Festival no longer appears in My Schedule
- Festival's "added" flag is set to false in database
- When viewing Festivals page, the festival shows "Add to Schedule" button again

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-006: Add Same Festival Twice (Idempotency)
**Priority:** P1  
**Test Type:** Functional - Edge Case

**Prerequisites:** 
- Festival is already in user's schedule

**Test Steps:**
1. Navigate to Festivals page
2. Observe the festival that's already added
3. Attempt to add it again (if button allows)

**Expected Result:**
- Button should show "Added" state and be disabled
- If somehow clicked, no duplicate is created
- User's schedule should have only one instance of the festival

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-007: Schedule State Persists After Page Refresh
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User has added festivals to schedule

**Test Steps:**
1. Add a festival to schedule
2. Refresh the browser page (F5 or Cmd+R)
3. Navigate to My Schedule

**Expected Result:**
- Added festival still appears in schedule
- "Added" state is maintained on festival cards
- Data persists (stored in database, not just client state)

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-008: Remove and Re-add Same Festival
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- User has a festival in schedule

**Test Steps:**
1. Navigate to My Schedule
2. Remove a festival from schedule
3. Navigate to Festivals page
4. Add the same festival back to schedule
5. Check My Schedule again

**Expected Result:**
- Festival is successfully removed
- Festival can be re-added
- Re-added festival appears in schedule correctly
- No duplicate entries

**Status:** Not Tested  
**Notes:**

---

### TC-SCH-009: Add Multiple Festivals Rapidly
**Priority:** P2  
**Test Type:** Functional - Stress

**Prerequisites:** 
- At least 5 festivals exist

**Test Steps:**
1. Navigate to Festivals page
2. Quickly click "Add to Schedule" on multiple festivals (5+)
3. Navigate to My Schedule

**Expected Result:**
- All festivals are added successfully
- No duplicates are created
- All button states update correctly
- Schedule displays all added festivals

**Status:** Not Tested  
**Notes:**

---

## 8. Navigation Test Cases

### TC-NAV-001: Navigate from Home to Festivals
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on homepage

**Test Steps:**
1. Click "Festivals" link in navigation bar
2. Observe URL and page content

**Expected Result:**
- URL changes to `/festivals`
- Festivals page loads
- Active nav item is highlighted

**Status:** Not Tested  
**Notes:**

---

### TC-NAV-002: Navigate from Home to Artists
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on homepage

**Test Steps:**
1. Click "Artists" link in navigation bar

**Expected Result:**
- URL changes to `/artists`
- Artists page loads
- Active nav item is highlighted

**Status:** Not Tested  
**Notes:**

---

### TC-NAV-003: Navigate to My Schedule
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on any page

**Test Steps:**
1. Click "My Schedule" link in navigation bar

**Expected Result:**
- URL changes to `/schedule` or similar
- Schedule page loads
- Active nav item is highlighted

**Status:** Not Tested  
**Notes:**

---

### TC-NAV-004: Navigate to Create Festival
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on any page

**Test Steps:**
1. Click link/button to create festival (may be in nav or on Festivals page)

**Expected Result:**
- Create Festival page loads
- URL changes appropriately
- Form is displayed with empty fields

**Status:** Not Tested  
**Notes:**

---

### TC-NAV-005: Navigate to Create Artist
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on any page

**Test Steps:**
1. Click link/button to create artist

**Expected Result:**
- Create Artist page loads
- Form is displayed with empty fields

**Status:** Not Tested  
**Notes:**

---

### TC-NAV-006: Browser Back Button Works Correctly
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- User has navigated through multiple pages

**Test Steps:**
1. Navigate: Home → Festivals → Festival Details
2. Click browser back button
3. Click back button again

**Expected Result:**
- First back: Returns to Festivals list
- Second back: Returns to Home
- Pages load correctly without errors
- State is preserved (e.g., scroll position)

**Status:** Not Tested  
**Notes:**

---

### TC-NAV-007: Logo/Home Link Returns to Homepage
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- User is on any page other than home

**Test Steps:**
1. Click on logo or "Home" link in navigation

**Expected Result:**
- User is taken to homepage
- URL is root `/` or `/home`

**Status:** Not Tested  
**Notes:**

---

### TC-NAV-008: Active Nav Item Highlighting
**Priority:** P3  
**Test Type:** UI/UX

**Prerequisites:** 
- User is on various pages

**Test Steps:**
1. Navigate to Festivals page
2. Observe nav bar
3. Navigate to Artists page
4. Observe nav bar

**Expected Result:**
- Current page's nav item is visually highlighted (different color, underline, etc.)
- Only one nav item is highlighted at a time
- Highlighting updates as user navigates

**Status:** Not Tested  
**Notes:**

---

## 9. Data Validation Test Cases

### TC-VAL-001: Date Format Validation
**Priority:** P1  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Enter invalid date format in Start Date field (e.g., "January 1, 2025" instead of "2025-01-01")
2. Attempt to submit

**Expected Result:**
- Validation error indicates correct format required
- Or: Date picker enforces correct format
- Form does not submit with invalid format

**Status:** Not Tested  
**Notes:**

---

### TC-VAL-002: Required Field Indicators
**Priority:** P2  
**Test Type:** UI/UX

**Prerequisites:** 
- User is on any form (Create Festival or Create Artist)

**Test Steps:**
1. Observe form fields

**Expected Result:**
- Required fields are marked with asterisk (*) or "required" label
- Clear visual distinction between required and optional fields
- User knows what fields are mandatory before attempting to submit

**Status:** Not Tested  
**Notes:**

---

### TC-VAL-003: Field Length Limits
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Festival or Create Artist form

**Test Steps:**
1. Attempt to enter extremely long text in various fields
2. Observe field behavior

**Expected Result:**
- Either: Field has character limit enforced (input stops accepting characters)
- Or: Validation error shown on submit if too long
- Or: All lengths accepted if no limit defined
- Behavior is consistent and documented

**Status:** Not Tested  
**Notes:**

---

### TC-VAL-004: Numeric Field Validation (Attendance)
**Priority:** P2  
**Test Type:** Functional

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Enter non-numeric value in Attendance field (e.g., "lots of people")
2. Attempt to submit

**Expected Result:**
- If field type is number: Non-numeric input is prevented or rejected
- If field type is text: Validation may or may not occur (depends on implementation)
- Clear error message if validation fails

**Status:** Not Tested  
**Notes:**

---

## 10. Security Test Cases

### TC-SEC-001: XSS Attack - Script Tag in Festival Name
**Priority:** P0  
**Test Type:** Security

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Enter festival name: `<script>alert('XSS')</script>`
2. Fill other required fields
3. Submit form
4. Navigate to Festivals page
5. Observe if script executes

**Expected Result:**
- Script does NOT execute
- Festival name is displayed as plain text (with tags visible or sanitized)
- No alert box appears
- Application is safe from XSS

**Status:** Not Tested  
**Notes:**

---

### TC-SEC-002: XSS Attack - Image Tag with onerror
**Priority:** P0  
**Test Type:** Security

**Prerequisites:** 
- User is on Create Festival page

**Test Steps:**
1. Enter festival name: `<img src=x onerror=alert('XSS')>`
2. Submit form
3. View festival in list or details

**Expected Result:**
- Script does NOT execute
- No alert appears
- Content is sanitized or displayed as plain text

**Status:** Not Tested  
**Notes:**

---

### TC-SEC-003: XSS Attack - HTML in Artist Bio
**Priority:** P0  
**Test Type:** Security

**Prerequisites:** 
- User is on Create Artist page

**Test Steps:**
1. Enter artist bio with malicious HTML:This is a bio. <script>document.location='http://malicious.com'</script>
2. Submit form
3. View artist details

**Expected Result:**
- Script does NOT execute
- User is NOT redirected
- Bio displays safely

**Status:** Not Tested  
**Notes:**

---

### TC-SEC-004: SQL/NoSQL Injection Attempt
**Priority:** P0  
**Test Type:** Security

**Prerequisites:** 
- User is on any form

**Test Steps:**
1. Enter injection payload in text fields:
   - `' OR '1'='1`
   - `{"$ne": null}`
   - `'; DROP TABLE festivals; --`
2. Submit form

**Expected Result:**
- No database manipulation occurs
- Mongoose protects against NoSQL injection
- Input is treated as literal string data
- No error exposing database structure

**Status:** Not Tested  
**Notes:**

---

### TC-SEC-005: Extremely Long Input (Buffer Overflow Attempt)
**Priority:** P1  
**Test Type:** Security

**Prerequisites:** 
- User is on any form

**Test Steps:**
1. Enter extremely long string in text fields (10,000+ characters)
2. Submit form

**Expected Result:**
- Application handles gracefully
- No crash or unhandled error
- Either: Input is accepted and truncated appropriately
- Or: Validation error indicates maximum length

**Status:** Not Tested  
**Notes:**

---

### TC-SEC-006: Special Characters and Encoding
**Priority:** P1  
**Test Type:** Security

**Prerequisites:** 
- User is on any form

**Test Steps:**
1. Enter various special characters: `& < > " ' / \ %20 %00`
2. Submit and view data

**Expected Result:**
- Characters are encoded/escaped properly
- No broken display
- No security vulnerabilities
- Data round-trips correctly (stored and retrieved as entered)

**Status:** Not Tested  
**Notes:**

---

## 11. Usability Test Cases

### TC-USA-001: Form Field Tab Order
**Priority:** P2  
**Test Type:** Usability

**Prerequisites:** 
- User is on any form

**Test Steps:**
1. Click in first form field
2. Press Tab key repeatedly
3. Observe focus movement

**Expected Result:**
- Tab key moves focus to next logical field
- Tab order is logical (top to bottom, left to right)
- All fields are reachable via Tab
- Submit button is last in tab order

**Status:** Not Tested  
**Notes:**

---

### TC-USA-002: Form Field Labels Are Clear
**Priority:** P2  
**Test Type:** Usability

**Prerequisites:** 
- User is on any form

**Test Steps:**
1. Read all form field labels
2. Assess clarity

**Expected Result:**
- All fields have clear, descriptive labels
- No ambiguous labels (user knows what to enter)
- Labels are concise but informative
- Placeholder text provides examples if helpful

**Status:** Not Tested  
**Notes:**

---

### TC-USA-003: Error Messages Are Helpful
**Priority:** P1  
**Test Type:** Usability

**Prerequisites:** 
- User is on Create Festival form

**Test Steps:**
1. Submit form with invalid data (e.g., endDate before startDate)
2. Read error message

**Expected Result:**
- Error message is specific (not just "Invalid input")
- Message explains what's wrong
- Message suggests how to fix it
- Message is displayed near the relevant field

**Status:** Not Tested  
**Notes:**

---

### TC-USA-004: Success Messages Are Clear
**Priority:** P2  
**Test Type:** Usability

**Prerequisites:** 
- User creates a festival or artist

**Test Steps:**
1. Successfully submit a form
2. Observe success feedback

**Expected Result:**
- Success message is clearly visible
- Message confirms what action was completed
- User knows what to do next (or is automatically redirected)
- Message disappears after appropriate time or can be dismissed

**Status:** Not Tested  
**Notes:**

---

### TC-USA-005: Button States Are Clear
**Priority:** P2  
**Test Type:** Usability

**Prerequisites:** 
- User is interacting with buttons

**Test Steps:**
1. Hover over buttons
2. Click buttons
3. Observe button states

**Expected Result:**
- Hover state provides visual feedback
- Active/clicked state is clear
- Disabled buttons are visually distinct
- Loading states show progress (spinner, text change)
- Button text is action-oriented ("Add to Schedule" not "Click Here")

**Status:** Not Tested  
**Notes:**

---

### TC-USA-006: Loading States During Data Fetch
**Priority:** P2  
**Test Type:** Usability

**Prerequisites:** 
- User navigates to page that loads data (Festivals, Artists)

**Test Steps:**
1. Navigate to Festivals page
2. Observe during data loading

**Expected Result:**
- Loading indicator appears (spinner, skeleton, "Loading...")
- User knows something is happening
- No blank screen with no feedback
- Content appears smoothly once loaded

**Status:** Not Tested  
**Notes:**

---

## 12. Cross-Browser Compatibility Test Cases

### TC-BROWSER-001: Chrome - Core Functionality
**Priority:** P1  
**Test Type:** Compatibility

**Prerequisites:** 
- Google Chrome browser (latest version)

**Test Steps:**
1. Open application in Chrome
2. Test all core workflows:
   - Browse festivals
   - Create festival
   - Add to schedule
   - Browse artists
   - Create artist

**Expected Result:**
- All functionality works correctly
- UI renders properly
- No console errors
- Date pickers work
- Forms submit successfully

**Status:** Not Tested  
**Notes:**

---

### TC-BROWSER-002: Safari - Core Functionality
**Priority:** P2  
**Test Type:** Compatibility

**Prerequisites:** 
- Safari browser (latest version, macOS)

**Test Steps:**
1. Open application in Safari
2. Test core workflows

**Expected Result:**
- All functionality works correctly in Safari
- Date pickers work (Safari has different date input behavior)
- CSS renders consistently
- JavaScript functions properly

**Status:** Not Tested  
**Notes:**

---

### TC-BROWSER-003: Firefox - Core Functionality
**Priority:** P2  
**Test Type:** Compatibility

**Prerequisites:** 
- Firefox browser (latest version)

**Test Steps:**
1. Open application in Firefox
2. Test core workflows

**Expected Result:**
- All functionality works correctly
- Form inputs work properly
- No layout issues
- JavaScript executes without errors

**Status:** Not Tested  
**Notes:**

---

## 13. Responsive Design Test Cases

### TC-RESP-001: Desktop View (1920x1080)
**Priority:** P1  
**Test Type:** Responsive

**Prerequisites:** 
- Browser window set to 1920x1080

**Test Steps:**
1. Navigate through all pages
2. Observe layout

**Expected Result:**
- All content is visible and properly laid out
- No horizontal scrolling
- Navigation is horizontal
- Festival/artist cards display in grid (3-4 per row)
- Forms are centered and appropriately sized

**Status:** Not Tested  
**Notes:**

---

### TC-RESP-002: Tablet View (768x1024)
**Priority:** P2  
**Test Type:** Responsive

**Prerequisites:** 
- Browser window resized to tablet dimensions

**Test Steps:**
1. Navigate through all pages
2. Test form interactions
3. Test navigation

**Expected Result:**
- Layout adapts appropriately
- Navigation may collapse to hamburger menu
- Cards display in 2-column grid
- Forms remain usable
- Text is readable
- Touch targets are adequately sized

**Status:** Not Tested  
**Notes:**

---

### TC-RESP-003: Mobile View (375x667)
**Priority:** P2  
**Test Type:** Responsive

**Prerequisites:** 
- Browser window resized to mobile dimensions

**Test Steps:**
1. Navigate through all pages on mobile view
2. Test all interactions

**Expected Result:**
- Layout is single-column
- Navigation is hamburger menu
- Cards stack vertically
- Forms are mobile-friendly
- Buttons are tappable (minimum 44x44px)
- No horizontal scrolling
- Text is legible without zooming

**Status:** Not Tested  
**Notes:**

---

### TC-RESP-004: Orientation Change (Mobile)
**Priority:** P3  
**Test Type:** Responsive

**Prerequisites:** 
- Mobile device or device emulation

**Test Steps:**
1. View application in portrait mode
2. Rotate to landscape mode
3. Rotate back to portrait

**Expected Result:**
- Layout adjusts smoothly
- No content is cut off
- All functionality remains accessible
- No errors occur

**Status:** Not Tested  
**Notes:**

---

## 14. Edge Cases and Error Handling

### TC-EDGE-001: No Internet Connection (API Failure)
**Priority:** P2  
**Test Type:** Error Handling

**Prerequisites:** 
- Application is running

**Test Steps:**
1. Disconnect from network (or simulate API failure)
2. Attempt to load Festivals page
3. Attempt to create a festival

**Expected Result:**
- Graceful error message displays
- Message is user-friendly (not technical error)
- User is informed of connection issue
- Application doesn't crash
- Retry mechanism available (if applicable)

**Status:** Not Tested  
**Notes:**

---

### TC-EDGE-002: Empty Database on First Launch
**Priority:** P2  
**Test Type:** Edge Case

**Prerequisites:** 
- Database is completely empty (no festivals, artists, or user)

**Test Steps:**
1. Launch application
2. Navigate to all pages

**Expected Result:**
- Application handles empty state gracefully
- No errors occur
- Empty state messages display
- User can start adding content immediately

**Status:** Not Tested  
**Notes:**

---

### TC-EDGE-003: Very Large Dataset (Performance)
**Priority:** P3  
**Test Type:** Performance

**Prerequisites:** 
- Database contains 100+ festivals and 100+ artists

**Test Steps:**
1. Navigate to Festivals page
2. Observe load time and responsiveness
3. Scroll through list
4. Repeat for Artists page

**Expected Result:**
- Pages load in reasonable time (<3 seconds)
- Scrolling is smooth
- No noticeable lag
- Consider pagination if performance degrades

**Status:** Not Tested  
**Notes:**

---

### TC-EDGE-004: User Document Missing from Database
**Priority:** P1  
**Test Type:** Error Handling

**Prerequisites:** 
- User document does not exist in database

**Test Steps:**
1. Attempt to add festival to schedule
2. Attempt to view My Schedule

**Expected Result:**
- Application handles missing user gracefully
- Creates user document if needed
- Or displays appropriate error message
- No application crash

**Status:** Not Tested  
**Notes:**

---

### TC-EDGE-005: Invalid Festival ID in URL
**Priority:** P2  
**Test Type:** Error Handling

**Prerequisites:** 
- User manually types invalid ID in URL

**Test Steps:**
1. Navigate to `/festivals/invalid-id-12345`
2. Observe result

**Expected Result:**
- 404 error page or "Festival not found" message
- User can navigate back to festivals list
- No application crash

**Status:** Not Tested  
**Notes:**

---

### TC-EDGE-006: Concurrent Users Adding Same Festival (Race Condition)
**Priority:** P3  
**Test Type:** Edge Case - Concurrency

**Prerequisites:** 
- Two browser windows open simultaneously

**Test Steps:**
1. In both windows, navigate to same festival
2. Click "Add to Schedule" in both windows at approximately same time
3. Check My Schedule

**Expected Result:**
- Only one instance of festival in schedule
- No duplicate entries
- Both windows show "Added" state correctly
- Database maintains data integrity

**Status:** Not Tested  
**Notes:**

---

## Test Execution Summary Template

**Test Execution Date:** [Date]  
**Tester:** Zach Talmadge  
**Build/Version:** [Version]  
**Environment:** [Browser/OS]

**Summary:**
- Total Test Cases: [Number]
- Executed: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]
- Not Tested: [Number]

**Pass Rate:** [Percentage]%

**Critical Issues Found:** [Number]
**High Priority Issues:** [Number]
**Medium Priority Issues:** [Number]
**Low Priority Issues:** [Number]

**Notes:**
[Any additional observations or comments]

---

**End of Test Cases Document**