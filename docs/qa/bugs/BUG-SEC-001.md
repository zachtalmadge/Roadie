# Bug Report #009: Permissive Type Coercion in Headliners Field

**Reported By:** Zach Talmadge  
**Date:** November 25, 2025  
**Severity:** Low  
**Priority:** Medium  
**Status:** Documented  
**Component:** Festivals API - Data Validation  
**Affected Endpoint:** `POST /festivals`

---

## Summary
The Festivals API accepts a single string for the `headliners` field when an array is expected, and Mongoose automatically coerces it into a single-element array. While this is Mongoose's default behavior, it represents overly permissive validation that could lead to unexpected behavior and potential security implications.

---

## Description
When creating a festival, the `headliners` field is defined in the schema as `[String]` (array of strings). However, the API accepts both:
- Array input: `headliners: ['Artist 1', 'Artist 2']` ✓ Expected
- String input: `headliners: 'Single Artist'` ✓ Unexpectedly accepted

Mongoose silently converts the string to `['Single Artist']`, which means:
1. No validation error is thrown
2. The API contract is unclear (should it accept strings or not?)
3. This could lead to inconsistent client-side behavior
4. Attackers could exploit this to bypass validation logic

---

## Steps to Reproduce

1. Send POST request to `/festivals` with string instead of array:
```bash
curl -X POST http://localhost:3000/festivals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Festival",
    "venue": "Test Venue",
    "location": "Test City",
    "startDate": "2025-06-01",
    "endDate": "2025-06-03",
    "headliners": "Single Artist",
    "camping": true,
    "attendance": "10000"
  }'
```

2. Observe: Request returns 200 (success)
3. Query database: `headliners` stored as `["Single Artist"]`

---

## Expected Behavior
**Option A (Strict Validation):**
- API should reject non-array input with 400 status
- Error message: "headliners must be an array"

**Option B (Current Behavior):**
- API accepts strings and coerces to array
- Document this behavior explicitly in API documentation

---

## Actual Behavior
- API silently accepts string input
- Mongoose converts string to single-element array
- No validation error thrown
- No documentation of this permissive behavior

---

## Impact Assessment

**Security Impact:** Low
- No data corruption
- No authentication/authorization bypass
- Could lead to unexpected behavior if client code assumes strict validation

**User Impact:** Low
- Users can accidentally send wrong data type
- Inconsistent API behavior could confuse developers

**Business Impact:** Low
- Functional impact minimal
- Documentation and API contract clarity affected

---

## Root Cause Analysis

**Why does this happen?**
1. Mongoose schema defines `headliners: { type: [String], required: true }`
2. Mongoose's default type coercion is permissive for arrays
3. When a single value is provided, Mongoose wraps it in an array
4. No explicit validation prevents this behavior

**Framework Behavior:**
This is intentional Mongoose behavior, not a code bug. From Mongoose documentation:
> "If you set a single value to an array path, Mongoose will wrap that value in an array for you."

---

## Recommended Solutions

### Solution 1: Add Explicit Array Validation (Recommended)
Update the schema to enforce array input:
```javascript
const FestivalSchema = new Schema({
  // ... other fields
  headliners: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'headliners must be an array'
    }
  }
});
```

**Pros:**
- Explicit validation
- Clear error messages
- Prevents unexpected type coercion

**Cons:**
- Slightly less convenient for API consumers
- Breaking change if clients rely on current behavior

---

### Solution 2: Document Current Behavior (Alternative)
Keep current behavior but document it clearly:
```javascript
/**
 * POST /festivals
 * 
 * Creates a new festival
 * 
 * @param {string} name - Festival name
 * @param {string} venue - Venue name
 * @param {string} location - Location
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string|string[]} headliners - Headliner(s). Single string will be converted to array.
 * @param {boolean} camping - Has camping
 * @param {string} attendance - Expected attendance
 */
```

**Pros:**
- No code changes needed
- Maintains backward compatibility

**Cons:**
- Less strict validation
- Inconsistent API contract

---

### Solution 3: Add Input Sanitization Middleware
Add middleware to normalize input before it reaches the controller:
```javascript
app.use('/festivals', (req, res, next) => {
  if (req.method === 'POST' && req.body.headliners) {
    if (typeof req.body.headliners === 'string') {
      req.body.headliners = [req.body.headliners];
    }
  }
  next();
});
```

**Pros:**
- Explicit handling
- Can log when coercion occurs
- Centralized logic

**Cons:**
- Adds complexity
- Still permissive

---

## Testing Evidence

Test case from `festivals.security.test.js`:
```javascript
it('should handle non-array input for headliners field by coercing to array', async () => {
  const festivalData = {
    name: 'Test Festival',
    venue: 'Test Venue',
    location: 'Test City',
    startDate: '2025-06-01',
    endDate: '2025-06-03',
    headliners: 'Single Artist', // String instead of array
    camping: true,
    attendance: '10000'
  };

  const response = await request(app)
    .post('/festivals')
    .send(festivalData)
    .expect(200); // Actually succeeds

  const festival = await Festivals.findOne({ name: 'Test Festival' });
  expect(Array.isArray(festival.headliners)).toBe(true);
  expect(festival.headliners).toEqual(['Single Artist']);
});
```

**Result:** Test confirms Mongoose coerces string to array

---

## Related Issues
- None currently
- Should be considered when implementing Artists API (similar array fields)

---

## Decision & Next Steps

**Recommendation:** Implement Solution 1 (Explicit Array Validation)

**Rationale:**
- Provides strictest validation
- Clear error messages for API consumers
- Aligns with principle of "fail fast"
- Makes API contract explicit
- Prevents potential future issues

**Implementation Priority:** Medium
- Not urgent (no security vulnerability)
- Should be addressed before v1.0 release
- Should be consistent across all API endpoints

---

## Tags
`security-testing` `data-validation` `type-coercion` `mongoose` `festivals-api` `low-severity`