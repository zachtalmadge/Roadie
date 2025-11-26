require('../../__tests__/setup'); 
const request = require('supertest');
const app = require('../../../server'); 
const Artists = require('../artists.schema');

describe('Artists Security Tests', () => {
  // No beforeAll/afterAll needed - setup.js handles it!
  // No afterEach for cleanup needed - setup.js handles it!

  // =================================================================
  // 1. XSS (Cross-Site Scripting) Prevention Tests
  // =================================================================
  describe('XSS Prevention', () => {
    it('should safely store script tags in artist name without execution', async () => {
      const xssPayload = {
        name: '<script>alert("XSS")</script>',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      const response = await request(app)
        .post('/artists')
        .send(xssPayload)
        .expect(200);

      const artist = await Artists.findOne({ name: xssPayload.name });
      expect(artist).toBeTruthy();
      expect(artist.name).toBe('<script>alert("XSS")</script>');
    });

    it('should safely store image XSS payload in bio field', async () => {
      const imgXssPayload = {
        name: 'Test Artist XSS Bio',
        bio: '<img src=x onerror=alert("XSS")>',
        genre: 'Pop',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      await request(app)
        .post('/artists')
        .send(imgXssPayload)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Test Artist XSS Bio' });
      expect(artist.bio).toBe('<img src=x onerror=alert("XSS")>');
    });

    it('should safely store iframe injection attempt in genre', async () => {
      const iframePayload = {
        name: 'Test Artist Iframe',
        bio: 'Test Bio',
        genre: '<iframe src="malicious.com"></iframe>',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      await request(app)
        .post('/artists')
        .send(iframePayload)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Test Artist Iframe' });
      expect(artist.genre).toBe('<iframe src="malicious.com"></iframe>');
    });

    it('should safely store javascript protocol in label field', async () => {
      const jsPayload = {
        name: 'Test Artist JS',
        bio: 'Test Bio',
        genre: 'Electronic',
        label: 'javascript:alert("XSS")',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      await request(app)
        .post('/artists')
        .send(jsPayload)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Test Artist JS' });
      expect(artist.label).toBe('javascript:alert("XSS")');
    });

    it('should safely store HTML entities in multiple fields', async () => {
      const htmlEntitiesPayload = {
        name: 'Artist & <Band>',
        bio: 'Bio with "quotes" and <tags>',
        genre: "Rock & Roll",
        label: 'Label <Records>',
        albums: ['Album <1>', 'Album & Two'],
        singles: ['Single "One"', 'Single <2>']
      };

      await request(app)
        .post('/artists')
        .send(htmlEntitiesPayload)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Artist & <Band>' });
      expect(artist.name).toBe('Artist & <Band>');
      expect(artist.bio).toBe('Bio with "quotes" and <tags>');
      expect(artist.albums).toEqual(['Album <1>', 'Album & Two']);
    });

    it('should safely store XSS payloads in array fields', async () => {
      const arrayXssPayload = {
        name: 'Array XSS Test',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: ['<script>alert("XSS")</script>', 'Normal Album'],
        singles: ['<img src=x onerror=alert("XSS")>', 'Normal Single']
      };

      await request(app)
        .post('/artists')
        .send(arrayXssPayload)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Array XSS Test' });
      expect(artist.albums).toContain('<script>alert("XSS")</script>');
      expect(artist.singles).toContain('<img src=x onerror=alert("XSS")>');
    });
  });

  // =================================================================
  // 2. NoSQL Injection Prevention Tests
  // =================================================================
  describe('NoSQL Injection Prevention', () => {
    beforeEach(async () => {
      // Create test artists for injection attempts
      await Artists.create([
        {
          name: 'Artist 1',
          bio: 'Bio 1',
          genre: 'Rock',
          label: 'Label 1',
          albums: ['Album 1'],
          singles: ['Single 1']
        },
        {
          name: 'Artist 2',
          bio: 'Bio 2',
          genre: 'Pop',
          label: 'Label 2',
          albums: ['Album 2'],
          singles: ['Single 2']
        }
      ]);
    });

    it('should prevent NoSQL injection in ID parameter using $ne operator', async () => {
      const response = await request(app)
        .get('/artists/{"$ne": null}')
        .expect(400);
    });

    it('should prevent NoSQL injection in ID parameter using $gt operator', async () => {
      const response = await request(app)
        .get('/artists/{"$gt": ""}')
        .expect(400);
    });

    it('should handle malformed JSON injection attempts', async () => {
      const response = await request(app)
        .get('/artists/{$where: "1==1"}')
        .expect(400);
    });

    it('should only accept valid ObjectId format for artistDetails', async () => {
      const validArtist = await Artists.findOne({});
      const validId = validArtist._id.toString();

      const validResponse = await request(app)
        .get(`/artists/${validId}`)
        .expect(200);

      expect(validResponse.body.name).toBe(validArtist.name);
    });
  });

  // =================================================================
  // 3. Mass Assignment & Schema Validation Tests
  // =================================================================
  describe('Mass Assignment Prevention', () => {
    it('should ignore additional fields not in schema', async () => {
      const artistData = {
        name: 'Test Artist Mass Assignment',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1'],
        isAdmin: true, // Not in schema
        verified: true, // Not in schema
        secretKey: 'abc123' // Not in schema
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Test Artist Mass Assignment' }).lean();
      
      // Extra fields should not exist
      expect(artist.isAdmin).toBeUndefined();
      expect(artist.verified).toBeUndefined();
      expect(artist.secretKey).toBeUndefined();
    });

    it('should not allow injection of Mongoose internal fields', async () => {
      const artistData = {
        name: 'Test Artist Internal',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1'],
        __v: 999, // Mongoose version field
        _id: '507f1f77bcf86cd799439011' // Try to set custom ID
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Test Artist Internal' }).lean();
      
      // Should have Mongoose defaults, not injected values
      expect(artist.__v).toBe(0); // Default version
      expect(artist._id.toString()).not.toBe('507f1f77bcf86cd799439011');
    });
  });

  // =================================================================
  // 4. Unique Constraint Security Tests
  // =================================================================
  describe('Unique Constraint Validation', () => {
    it('should prevent duplicate artist names', async () => {
      const artistData = {
        name: 'Duplicate Artist',
        bio: 'First Bio',
        genre: 'Rock',
        label: 'Label 1',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      // First creation should succeed
      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      // Second creation with same name should fail
      const duplicateData = {
        name: 'Duplicate Artist',
        bio: 'Different Bio',
        genre: 'Pop',
        label: 'Label 2',
        albums: ['Album 2'],
        singles: ['Single 2']
      };

      await request(app)
        .post('/artists')
        .send(duplicateData)
        .expect(400);

      // Verify only one artist exists
      const artists = await Artists.find({ name: 'Duplicate Artist' });
      expect(artists).toHaveLength(1);
      expect(artists[0].bio).toBe('First Bio'); // Original data preserved
    });

    it('should handle case-sensitive duplicate names', async () => {
      await request(app)
        .post('/artists')
        .send({
          name: 'Test Artist',
          bio: 'Bio',
          genre: 'Rock',
          label: 'Label',
          albums: [],
          singles: []
        })
        .expect(200);

      // MongoDB unique constraint is case-sensitive by default
      // This WILL create a separate artist (potential issue!)
      await request(app)
        .post('/artists')
        .send({
          name: 'test artist', // lowercase
          bio: 'Bio',
          genre: 'Rock',
          label: 'Label',
          albums: [],
          singles: []
        })
        .expect(200);

      const artists = await Artists.find({ 
        name: { $regex: /^test artist$/i } 
      });
      expect(artists).toHaveLength(2); // Both exist!
    });
  });

  // =================================================================
  // 5. Input Validation & Edge Cases
  // =================================================================
  describe('Input Validation Security', () => {
    it('should handle extremely long strings without causing issues', async () => {
      const longString = 'A'.repeat(10000);
      const artistData = {
        name: 'Long String Test',
        bio: longString,
        genre: 'Rock',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Long String Test' });
      expect(artist.bio.length).toBe(10000);
    });

    it('should handle large arrays of albums and singles', async () => {
      const longArray = Array(100).fill('Track ').map((t, i) => t + i);
      const artistData = {
        name: 'Large Array Test',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: longArray,
        singles: longArray
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Large Array Test' });
      expect(artist.albums).toHaveLength(100);
      expect(artist.singles).toHaveLength(100);
    });

    it('should handle special Unicode characters', async () => {
      const artistData = {
        name: 'Артист 音楽家 🎵',
        bio: 'Biography with émojis 🎸 and spëcial çhars',
        genre: 'Рок-музыка',
        label: '音楽レーベル',
        albums: ['Альбом 1', '专辑 2'],
        singles: ['Сингл 1', 'シングル 2']
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Артист 音楽家 🎵' });
      expect(artist.name).toBe('Артист 音楽家 🎵');
      expect(artist.genre).toBe('Рок-музыка');
    });

    it('should handle null byte injection attempts', async () => {
      const artistData = {
        name: 'Test\0Artist',
        bio: 'Bio\0with\0nulls',
        genre: 'Rock\0',
        label: 'Label\0',
        albums: ['Album\0One'],
        singles: ['Single\0One']
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({});
      expect(artist.name).toContain('Test');
    });

    it('should handle all optional fields being omitted', async () => {
      const minimalData = {
        name: 'Minimal Artist'
      };

      await request(app)
        .post('/artists')
        .send(minimalData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Minimal Artist' });
      expect(artist.name).toBe('Minimal Artist');
      expect(artist.bio).toBeUndefined();
      expect(artist.genre).toBeUndefined();
      expect(artist.label).toBeUndefined();
    });

    it('should handle empty arrays for albums and singles', async () => {
      const artistData = {
        name: 'Empty Arrays Test',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: [],
        singles: []
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Empty Arrays Test' });
      expect(artist.albums).toEqual([]);
      expect(artist.singles).toEqual([]);
    });
  });

  // =================================================================
  // 6. Error Handling & Information Disclosure
  // =================================================================
  describe('Error Handling Security', () => {
    it('should return 400 without exposing stack traces for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/artists/invalid-id-format')
        .expect(400);

      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('Error:');
      expect(responseText).not.toContain('at ');
      expect(responseText).not.toContain('mongoose');
    });

    it('should return 400 without exposing database details on duplicate name', async () => {
      const artistData = {
        name: 'Duplicate Test',
        bio: 'Bio',
        genre: 'Rock',
        label: 'Label',
        albums: [],
        singles: []
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const response = await request(app)
        .post('/artists')
        .send(artistData)
        .expect(400);

      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('MongoError');
      expect(responseText).not.toContain('E11000');
      expect(responseText).not.toContain('duplicate key');
    });

    it('should handle malformed request body gracefully', async () => {
      const response = await request(app)
        .post('/artists')
        .set('Content-Type', 'application/json')
        .send('{"invalid json"}')
        .expect(400);
    });
  });

  // =================================================================
  // 7. Data Type Validation & Coercion
  // =================================================================
  describe('Data Type Security', () => {
    it('should handle type coercion for albums array field', async () => {
      const artistData = {
        name: 'Albums Coercion Test',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: 'Single Album', // String instead of array
        singles: ['Single 1']
      };

      // SECURITY FINDING: Same as festivals - Mongoose coerces string to array
      // See BUG-API-009 for similar issue
      const response = await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Albums Coercion Test' });
      expect(Array.isArray(artist.albums)).toBe(true);
      expect(artist.albums).toEqual(['Single Album']);
    });

    it('should handle type coercion for singles array field', async () => {
      const artistData = {
        name: 'Singles Coercion Test',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: 'Single Track' // String instead of array
      };

      const response = await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Singles Coercion Test' });
      expect(Array.isArray(artist.singles)).toBe(true);
      expect(artist.singles).toEqual(['Single Track']);
    });

    it('should handle non-string primitives in string fields', async () => {
      const artistData = {
        name: 'Type Coercion Test',
        bio: 12345, // Number instead of string
        genre: true, // Boolean instead of string
        label: null, // Null value
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Type Coercion Test' });
      expect(typeof artist.bio).toBe('string');
      expect(artist.bio).toBe('12345');
      expect(typeof artist.genre).toBe('string');
      expect(artist.genre).toBe('true');
    });
  });

  // =================================================================
  // 8. Response Data Security
  // =================================================================
  describe('Response Data Security', () => {
    it('should exclude _id field from artistDetails response', async () => {
      const artistData = {
        name: 'Response Test Artist',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const artist = await Artists.findOne({ name: 'Response Test Artist' });
      const response = await request(app)
        .get(`/artists/${artist._id}`)
        .expect(200);

      // _id should be excluded from response
      expect(response.body._id).toBeUndefined();
      expect(response.body.name).toBe('Response Test Artist');
    });

    it('should include _id in getArtists list response', async () => {
      const artistData = {
        name: 'List Test Artist',
        bio: 'Test Bio',
        genre: 'Rock',
        label: 'Test Label',
        albums: ['Album 1'],
        singles: ['Single 1']
      };

      await request(app)
        .post('/artists')
        .send(artistData)
        .expect(200);

      const response = await request(app)
        .get('/artists')
        .expect(200);

      const artist = response.body.find(a => a.name === 'List Test Artist');
      expect(artist._id).toBeDefined();
      expect(typeof artist._id).toBe('string');
    });
  });
});

/*
 * ARTISTS SECURITY TEST SUITE
 * 
 * Test Categories: 8
 * Total Tests: 27
 * 
 * Coverage:
 * - XSS Prevention: 6 tests (including array fields)
 * - NoSQL Injection: 4 tests
 * - Mass Assignment: 2 tests
 * - Unique Constraints: 2 tests (NEW - found BUG-API-010)
 * - Input Validation: 6 tests
 * - Error Handling: 3 tests
 * - Data Type Security: 3 tests
 * - Response Data: 2 tests (NEW - _id exclusion behavior)
 * 
 * Security Findings:
 * - BUG-API-009: Array type coercion (albums, singles) - Same as festivals
 * - BUG-API-010: Case-sensitive duplicates allowed - MEDIUM SEVERITY
 * 
 * Highlights:
 * - Discovered case-sensitivity bug in unique constraint
 * - Verified response data security (_id exclusion)
 * - Tested Unicode and internationalization edge cases
 * - Comprehensive XSS testing including array fields
 */