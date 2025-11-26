# Bug Report: BUG-API-010 - Case-Sensitive Duplicate Artist Names Allowed

**Bug ID:** BUG-API-010  
**Component:** API - Artists Endpoint  
**Reported By:** Zach Talmadge  
**Date:** November 25, 2025  
**Severity:** Medium  
**Priority:** High  
**Status:** Documented  
**Affected Endpoint:** `POST /artists`  
**Field:** name (unique constraint)

---

## Summary
The Artists API's unique constraint on the `name` field is case-sensitive, allowing duplicate artists with different casing (e.g., "The Beatles" and "the beatles" can both exist). This could lead to data inconsistency, duplicate content, and poor user experience.

---

## Description
The Artist schema defines `name: { type: String, unique: true }`, but MongoDB's unique indexes are case-sensitive by default. This means:
- "Test Artist" can be created ✓
- "test artist" can also be created ✓ (should be prevented)
- "TEST ARTIST" can also be created ✓ (should be prevented)

This allows multiple "duplicate" artists with different casing to exist in the database.

---

## Steps to Reproduce

1. Create an artist with name "The Beatles":
```bash
curl -X POST http://localhost:3000/artists \
  -H "Content-Type: application/json" \
  -d '{"name": "The Beatles", "genre": "Rock"}'
```
Response: 200 (success)

2. Create another artist with name "the beatles":
```bash
curl -X POST http://localhost:3000/artists \
  -H "Content-Type: application/json" \
  -d '{"name": "the beatles", "genre": "Rock"}'
```
Response: 200 (success) ← **Should fail with 400**

3. Query database:
```javascript
db.artists.find({ name: /^the beatles$/i })
// Returns 2 documents
```

---

## Expected Behavior
Unique constraint should be case-insensitive:
- "The Beatles" created → Success
- "the beatles" attempted → 400 error: "Artist name already exists"
- Frontend should display clear error message

---

## Actual Behavior
- Both "The Beatles" and "the beatles" can be created
- No error thrown
- Database contains duplicate artists with different casing

---

## Impact Assessment

**Security Impact:** Low
- No authentication bypass or data breach
- Could be exploited to pollute database with duplicates

**User Impact:** High
- Users may accidentally create duplicate artists
- Search results may show duplicates
- Data inconsistency in production

**Business Impact:** Medium
- Poor user experience
- Data quality issues
- Manual cleanup required

---

## Root Cause Analysis

**Why does this happen?**
1. Schema defines `unique: true` on name field
2. MongoDB creates unique index with default case-sensitive collation
3. "Test Artist" and "test artist" are different strings to MongoDB
4. No application-level validation for case-insensitive uniqueness

**MongoDB Behavior:**
```javascript
// These are all different to MongoDB's default index
"The Beatles"
"the beatles"
"THE BEATLES"
"ThE BeAtLeS"
```

---

## Recommended Solutions

### Solution 1: Case-Insensitive Collation Index (Recommended)
Drop existing index and recreate with case-insensitive collation:
```javascript
// Migration script
db.artists.dropIndex("name_1");
db.artists.createIndex(
  { name: 1 },
  { 
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);
```

Update Mongoose schema to use collation:
```javascript
const ArtistSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  }
});

// Add index with collation
ArtistSchema.index(
  { name: 1 },
  { 
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);
```

**Pros:**
- Database-level enforcement
- Most reliable solution
- Handles all edge cases

**Cons:**
- Requires database migration
- Existing duplicates must be cleaned up first

---

### Solution 2: Pre-Save Hook with Lowercase Normalization
Normalize names to lowercase before saving:
```javascript
ArtistSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    // Check for case-insensitive duplicate
    const existingArtist = await this.constructor.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id }
    });
    
    if (existingArtist) {
      throw new Error('Artist name already exists (case-insensitive)');
    }
  }
  next();
});
```

**Pros:**
- Application-level control
- Can provide custom error messages
- No database migration needed

**Cons:**
- Not database-enforced
- Potential race condition between check and save
- Additional query on every save

---

### Solution 3: Store Lowercase Version in Separate Field
Add a `name_lowercase` field for uniqueness:
```javascript
const ArtistSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  name_lowercase: {
    type: String,
    unique: true,
    required: true
  }
});

ArtistSchema.pre('save', function(next) {
  this.name_lowercase = this.name.toLowerCase();
  next();
});
```

**Pros:**
- Database-enforced uniqueness
- Preserves original casing for display
- Fast lookups

**Cons:**
- Data duplication
- Must maintain sync between fields

---

## Testing Evidence

Test case from `artists.security.test.js`:
```javascript
it('should handle case-sensitive duplicate names', async () => {
  await request(app)
    .post('/artists')
    .send({ name: 'Test Artist', genre: 'Rock' })
    .expect(200);

  // This succeeds but should fail
  await request(app)
    .post('/artists')
    .send({ name: 'test artist', genre: 'Rock' })
    .expect(200); // ← Bug: Should be 400

  const artists = await Artists.find({ 
    name: { $regex: /^test artist$/i } 
  });
  expect(artists).toHaveLength(2); // Both exist!
});
```

**Result:** Test confirms case-sensitive duplicates are allowed

---

## Related Issues
- BUG-API-009: Array type coercion (same codebase issue)
- Future: Consider slug field for URL-safe artist identifiers

---

## Decision & Next Steps

**Recommendation:** Implement Solution 1 (Case-Insensitive Collation Index)

**Rationale:**
- Most robust and reliable
- Database-level enforcement prevents race conditions
- Industry standard approach
- Aligns with user expectations

**Implementation Plan:**
1. **Pre-migration:** Query for existing case-insensitive duplicates
2. **Manual cleanup:** Merge or delete duplicate artists
3. **Migration:** Drop index, create with collation
4. **Testing:** Verify duplicate prevention works
5. **Documentation:** Update API docs with behavior

**Implementation Priority:** High
- Medium severity but high user impact
- Should be fixed before production launch
- Data cleanup easier with small dataset

---

## Tags
`security-testing` `data-validation` `unique-constraint` `case-sensitivity` `artists-api` `medium-severity`