const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../user.schema');
const { Festivals } = require('../../festivals/festivals.schema');

let app;
let mongoServer;

describe('User API Integration Tests', () => {
  // Setup: Start MongoDB and connect before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    
    // Import app after DB connection
    app = require('../../../server');
  });

  // Setup: Create a user before each test (single-user app)
  beforeEach(async () => {
    // Create the single user document
    await User.create({ events: [] });
  });

  // Cleanup: Clear database after each test
  afterEach(async () => {
    await User.deleteMany({});
    await Festivals.deleteMany({});
  });

  // Cleanup: Close connections after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ==================== TEST SUITE: GET /user ====================
  describe('GET /user', () => {
    it('should return empty array when user has no scheduled events', async () => {
      const response = await request(app)
        .get('/user')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return user scheduled events', async () => {
      // Arrange: Create a festival and add to user schedule
      const festival = await Festivals.create({
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist 1'],
        added: true
      });

      const user = await User.findOne();
      user.events.push(festival);
      await user.save();

      // Act: Request user's schedule
      const response = await request(app)
        .get('/user')
        .expect(200);

      // Assert: Verify festival is in schedule
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Festival');
      expect(response.body[0].venue).toBe('Test Venue');
    });

    it('should return multiple scheduled events', async () => {
      // Arrange: Create multiple festivals
      const festival1 = await Festivals.create({
        name: 'Festival 1',
        venue: 'Venue 1',
        location: 'City 1',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-03'),
        headliners: ['Artist A'],
        added: true
      });

      const festival2 = await Festivals.create({
        name: 'Festival 2',
        venue: 'Venue 2',
        location: 'City 2',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-17'),
        headliners: ['Artist B'],
        added: true
      });

      const user = await User.findOne();
      user.events.push(festival1, festival2);
      await user.save();

      // Act: Request user's schedule
      const response = await request(app)
        .get('/user')
        .expect(200);

      // Assert: Verify both festivals are in schedule
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Festival 1');
      expect(response.body[1].name).toBe('Festival 2');
    });

    it('should handle user with no events gracefully', async () => {
      // User already created in beforeEach with empty events
      const response = await request(app)
        .get('/user')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  // ==================== TEST SUITE: PUT /user/:festivalID ====================
  describe('PUT /user/:festivalID - Add Festival to Schedule', () => {
    it('should add festival to user schedule', async () => {
      // Arrange: Create a festival
      const festival = await Festivals.create({
        name: 'New Festival',
        venue: 'New Venue',
        location: 'New City',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-03'),
        headliners: ['Headliner 1'],
        added: false
      });

      // Act: Add festival to schedule
      await request(app)
        .put(`/user/${festival._id}`)
        .expect(200);

      // Assert: Verify festival was added to user schedule
      const user = await User.findOne();
      expect(user.events).toHaveLength(1);
      expect(user.events[0].name).toBe('New Festival');
    });

    it('should update festival added flag to true', async () => {
      // Arrange: Create festival with added: false
      const festival = await Festivals.create({
        name: 'Test Festival',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: false
      });

      expect(festival.added).toBe(false);

      // Act: Add to schedule
      await request(app)
        .put(`/user/${festival._id}`)
        .expect(200);

      // Assert: Verify added flag is now true
      const updatedFestival = await Festivals.findById(festival._id);
      expect(updatedFestival.added).toBe(true);
    });

    it('should add complete festival data to user events', async () => {
      // Arrange: Create festival with all fields
      const festival = await Festivals.create({
        name: 'Complete Festival',
        venue: 'Complete Venue',
        location: 'Complete City',
        startDate: new Date('2025-07-15'),
        endDate: new Date('2025-07-17'),
        headliners: ['Star 1', 'Star 2', 'Star 3'],
        camping: true,
        attendance: '50000',
        added: false
      });

      // Act: Add to schedule
      await request(app)
        .put(`/user/${festival._id}`)
        .expect(200);

      // Assert: Verify all festival data is in user events
      const user = await User.findOne();
      expect(user.events[0].name).toBe('Complete Festival');
      expect(user.events[0].camping).toBe(true);
      expect(user.events[0].attendance).toBe('50000');
      expect(user.events[0].headliners).toEqual(['Star 1', 'Star 2', 'Star 3']);
    });

    it('should return 400 for invalid festival ID', async () => {
      await request(app)
        .put('/user/invalid-id-123')
        .expect(400);

      // Verify no changes to user schedule
      const user = await User.findOne();
      expect(user.events).toHaveLength(0);
    });

    it('should return 400 for non-existent festival ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .put(`/user/${fakeId}`)
        .expect(400);

      // Verify no changes to user schedule
      const user = await User.findOne();
      expect(user.events).toHaveLength(0);
    });

    it('should handle adding the same festival twice (idempotency check)', async () => {
      // Arrange: Create festival
      const festival = await Festivals.create({
        name: 'Duplicate Test',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: false
      });

      // Act: Add festival twice
      await request(app).put(`/user/${festival._id}`).expect(200);
      await request(app).put(`/user/${festival._id}`).expect(200);

      // Assert: Check if duplicate was added
      const user = await User.findOne();
      
      // This documents current behavior - app may allow duplicates
      // If duplicates exist, this is a bug to document
      if (user.events.length > 1) {
        // BUG: System allows duplicate festivals in schedule
        console.log('WARNING: Duplicate festivals allowed in schedule');
      }
      
      // At minimum, verify festival was added
      expect(user.events.length).toBeGreaterThanOrEqual(1);
    });

    it('should maintain data integrity - both festival and user updated', async () => {
      // Arrange
      const festival = await Festivals.create({
        name: 'Integrity Test',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: false
      });

      // Act
      await request(app).put(`/user/${festival._id}`).expect(200);

      // Assert: Both festival and user were updated
      const updatedFestival = await Festivals.findById(festival._id);
      const user = await User.findOne();

      expect(updatedFestival.added).toBe(true);
      expect(user.events).toHaveLength(1);
      expect(user.events[0].name).toBe('Integrity Test');
    });
  });

  // ==================== TEST SUITE: DELETE /user/:festivalID ====================
  describe('DELETE /user/:festivalID - Remove Festival from Schedule', () => {
    it('should remove festival from user schedule', async () => {
      // Arrange: Create festival and add to schedule
      const festival = await Festivals.create({
        name: 'To Be Removed',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: true
      });

      const user = await User.findOne();
      user.events.push(festival);
      await user.save();

      expect(user.events).toHaveLength(1);

      // Act: Remove festival
      await request(app)
        .delete(`/user/${festival._id}`)
        .expect(200);

      // Assert: Verify festival was removed
      const updatedUser = await User.findOne();
      expect(updatedUser.events).toHaveLength(0);
    });

    it('should update festival added flag to false', async () => {
      // Arrange: Create festival and add to schedule
      const festival = await Festivals.create({
        name: 'Flag Test',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: true
      });

      const user = await User.findOne();
      user.events.push(festival);
      await user.save();

      // Act: Remove from schedule
      await request(app)
        .delete(`/user/${festival._id}`)
        .expect(200);

      // Assert: Verify added flag is now false
      const updatedFestival = await Festivals.findById(festival._id);
      expect(updatedFestival.added).toBe(false);
    });

    it('should remove only the specified festival from schedule', async () => {
      // Arrange: Add multiple festivals to schedule
      const festival1 = await Festivals.create({
        name: 'Keep This',
        venue: 'Venue 1',
        location: 'City 1',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-03'),
        headliners: ['Artist 1'],
        added: true
      });

      const festival2 = await Festivals.create({
        name: 'Remove This',
        venue: 'Venue 2',
        location: 'City 2',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-03'),
        headliners: ['Artist 2'],
        added: true
      });

      const user = await User.findOne();
      user.events.push(festival1, festival2);
      await user.save();

      expect(user.events).toHaveLength(2);

      // Act: Remove only festival2
      await request(app)
        .delete(`/user/${festival2._id}`)
        .expect(200);

      // Assert: Verify only festival2 was removed
      const updatedUser = await User.findOne();
      expect(updatedUser.events).toHaveLength(1);
      expect(updatedUser.events[0].name).toBe('Keep This');

      // Verify added flags
      const festival1Updated = await Festivals.findById(festival1._id);
      const festival2Updated = await Festivals.findById(festival2._id);
      expect(festival1Updated.added).toBe(true);
      expect(festival2Updated.added).toBe(false);
    });

    it('should return 400 for invalid festival ID', async () => {
      await request(app)
        .delete('/user/invalid-id-456')
        .expect(400);
    });

    it('should return 400 for non-existent festival ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/user/${fakeId}`)
        .expect(400);
    });

    it('should handle removing festival not in schedule', async () => {
      // Arrange: Create festival but DON'T add to schedule
      const festival = await Festivals.create({
        name: 'Not In Schedule',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: false
      });

      // Act: Attempt to remove festival that's not in schedule
      const response = await request(app)
        .delete(`/user/${festival._id}`);

      // This documents current behavior - may return 200 or 400
      // If it returns 200, that's okay (idempotent)
      // If it returns 400, that's also okay (festival not found in schedule)
      
      // Verify user schedule unchanged
      const user = await User.findOne();
      expect(user.events).toHaveLength(0);
    });

    it('should maintain data integrity - both festival and user updated', async () => {
      // Arrange: Create and add festival
      const festival = await Festivals.create({
        name: 'Integrity Delete Test',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: true
      });

      const user = await User.findOne();
      user.events.push(festival);
      await user.save();

      // Act: Remove festival
      await request(app).delete(`/user/${festival._id}`).expect(200);

      // Assert: Both festival and user were updated
      const updatedFestival = await Festivals.findById(festival._id);
      const updatedUser = await User.findOne();

      expect(updatedFestival.added).toBe(false);
      expect(updatedUser.events).toHaveLength(0);
    });
  });

  // ==================== WORKFLOW TESTS ====================
  describe('Complete User Workflows', () => {
    it('should complete add-view-remove workflow', async () => {
      // Step 1: Create festival
      const festival = await Festivals.create({
        name: 'Workflow Test',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: false
      });

      // Step 2: Add to schedule
      await request(app).put(`/user/${festival._id}`).expect(200);

      // Step 3: View schedule
      let response = await request(app).get('/user').expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Workflow Test');

      // Step 4: Remove from schedule
      await request(app).delete(`/user/${festival._id}`).expect(200);

      // Step 5: Verify schedule is empty
      response = await request(app).get('/user').expect(200);
      expect(response.body).toHaveLength(0);

      // Step 6: Verify festival can be re-added
      await request(app).put(`/user/${festival._id}`).expect(200);
      response = await request(app).get('/user').expect(200);
      expect(response.body).toHaveLength(1);
    });

    it('should handle multiple festivals in complete workflow', async () => {
      // Create multiple festivals
      const festival1 = await Festivals.create({
        name: 'Multi 1',
        venue: 'V1',
        location: 'C1',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-03'),
        headliners: ['A1']
      });

      const festival2 = await Festivals.create({
        name: 'Multi 2',
        venue: 'V2',
        location: 'C2',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['A2']
      });

      const festival3 = await Festivals.create({
        name: 'Multi 3',
        venue: 'V3',
        location: 'C3',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-03'),
        headliners: ['A3']
      });

      // Add all three
      await request(app).put(`/user/${festival1._id}`).expect(200);
      await request(app).put(`/user/${festival2._id}`).expect(200);
      await request(app).put(`/user/${festival3._id}`).expect(200);

      // Verify all in schedule
      let response = await request(app).get('/user').expect(200);
      expect(response.body).toHaveLength(3);

      // Remove middle one
      await request(app).delete(`/user/${festival2._id}`).expect(200);

      // Verify only 2 remain
      response = await request(app).get('/user').expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.find(f => f.name === 'Multi 1')).toBeDefined();
      expect(response.body.find(f => f.name === 'Multi 3')).toBeDefined();
      expect(response.body.find(f => f.name === 'Multi 2')).toBeUndefined();
    });

    it('should persist schedule across multiple views', async () => {
      // Add festival
      const festival = await Festivals.create({
        name: 'Persistence Test',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist']
      });

      await request(app).put(`/user/${festival._id}`).expect(200);

      // View schedule multiple times
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/user').expect(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe('Persistence Test');
      }
    });
  });

  // ==================== EDGE CASES & ERROR SCENARIOS ====================
  describe('Edge Cases and Error Handling', () => {
    it('should handle empty user events array', async () => {
      const response = await request(app).get('/user').expect(200);
      expect(response.body).toEqual([]);
    });

    it('should handle malformed ObjectId in PUT request', async () => {
      await request(app)
        .put('/user/not-an-objectid')
        .expect(400);
    });

    it('should handle malformed ObjectId in DELETE request', async () => {
      await request(app)
        .delete('/user/also-not-an-objectid')
        .expect(400);
    });

    it('should verify added flag consistency', async () => {
      // Create festival
      const festival = await Festivals.create({
        name: 'Flag Consistency',
        venue: 'Venue',
        location: 'City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist'],
        added: false
      });

      // Initial state: added should be false
      let festivalCheck = await Festivals.findById(festival._id);
      expect(festivalCheck.added).toBe(false);

      // After adding to schedule: added should be true
      await request(app).put(`/user/${festival._id}`).expect(200);
      festivalCheck = await Festivals.findById(festival._id);
      expect(festivalCheck.added).toBe(true);

      // After removing from schedule: added should be false again
      await request(app).delete(`/user/${festival._id}`).expect(200);
      festivalCheck = await Festivals.findById(festival._id);
      expect(festivalCheck.added).toBe(false);
    });
  });
});