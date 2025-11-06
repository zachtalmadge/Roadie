const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Festivals } = require('../festivals.schema');

// Import  Express app
// IMPORTANT: You'll need to export your app from server.js
// handle this in the next step
let app;
let mongoServer;

describe('Festivals API Integration Tests', () => {
  // Setup: Start MongoDB and connect before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    
    // Import app after DB connection
    app = require('../../../server');
  });

  // Cleanup: Clear database after each test
  afterEach(async () => {
    await Festivals.deleteMany({});
  });

  // Cleanup: Close connections after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // TEST SUITE: GET /festivals
  describe('GET /festivals', () => {
    it('should return empty array when no festivals exist', async () => {
      const response = await request(app)
        .get('/festivals')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all festivals sorted by startDate', async () => {
      // Arrange: Create test festivals
      const festival1 = await Festivals.create({
        name: 'Festival A',
        venue: 'Venue A',
        location: 'City A',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-17'),
        headliners: ['Artist 1'],
        added: false
      });

      const festival2 = await Festivals.create({
        name: 'Festival B',
        venue: 'Venue B',
        location: 'City B',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-03'),
        headliners: ['Artist 2'],
        added: false
      });

      // Act: Request festivals
      const response = await request(app)
        .get('/festivals')
        .expect(200);

      // Assert: Check response
      expect(response.body).toHaveLength(2);
      // Festival B should come first (earlier date)
      expect(response.body[0].name).toBe('Festival B');
      expect(response.body[1].name).toBe('Festival A');
    });
  });

  // TEST SUITE: POST /festivals
  describe('POST /festivals', () => {
    it('should create festival with all required fields', async () => {
      // Arrange: Prepare festival data
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City, CA',
        startDate: '2025-07-01',
        endDate: '2025-07-03',
        headliners: ['Artist 1', 'Artist 2']
      };

      // Act: Send POST request
      const response = await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(200);

      // Assert: Verify festival was created in database
      const festival = await Festivals.findOne({ name: 'Test Festival' });
      expect(festival).toBeDefined();
      expect(festival.name).toBe('Test Festival');
      expect(festival.venue).toBe('Test Venue');
      expect(festival.added).toBe(false); // Default value
    });

    it('should create festival with optional fields', async () => {
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City, CA',
        startDate: '2025-07-01',
        endDate: '2025-07-03',
        headliners: ['Artist 1'],
        camping: true,
        attendance: '50000'
      };

      await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(200);

      const festival = await Festivals.findOne({ name: 'Test Festival' });
      expect(festival.camping).toBe(true);
      expect(festival.attendance).toBe('50000');
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidData = {
        venue: 'Test Venue',
        // Missing: name, location, dates, headliners
      };

      await request(app)
        .post('/festivals')
        .send(invalidData)
        .expect(400);

      // Verify festival was NOT created
      const count = await Festivals.countDocuments();
      expect(count).toBe(0);
    });
  });

  // TEST SUITE: GET /festivals/:id
  describe('GET /festivals/:id', () => {
    it('should return specific festival by ID', async () => {
      // Arrange: Create a festival
      const festival = await Festivals.create({
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        headliners: ['Artist 1']
      });

      // Act: Request specific festival
      const response = await request(app)
        .get(`/festivals/${festival._id}`)
        .expect(200);

      // Assert: Verify response
      expect(response.body.name).toBe('Test Festival');
      expect(response.body.venue).toBe('Test Venue');
    });

    it('should return 400 for invalid festival ID', async () => {
      await request(app)
        .get('/festivals/invalid-id-123')
        .expect(400);
    });
  });
});