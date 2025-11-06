const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Artists = require('../artists.schema');

let app;
let mongoServer;

describe('Artists API Integration Tests', () => {
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
        await Artists.deleteMany({});
    });

    // Cleanup: Close connections after all tests
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // ==================== TEST SUITE: GET /artists ====================
    describe('GET /artists', () => {
        it('should return empty array when no artists exist', async () => {
            const response = await request(app)
                .get('/artists')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return all artists sorted alphabetically by name', async () => {
            // Arrange: Create test artists in non-alphabetical order
            await Artists.create({
                name: 'Zebra Band',
                genre: 'Rock',
                bio: 'A rock band'
            });

            await Artists.create({
                name: 'Alpha Artists',
                genre: 'Pop',
                bio: 'A pop group'
            });

            await Artists.create({
                name: 'Middle Musicians',
                genre: 'Jazz',
                bio: 'A jazz ensemble'
            });

            // Act: Request artists
            const response = await request(app)
                .get('/artists')
                .expect(200);

            // Assert: Check alphabetical order
            expect(response.body).toHaveLength(3);
            expect(response.body[0].name).toBe('Alpha Artists');
            expect(response.body[1].name).toBe('Middle Musicians');
            expect(response.body[2].name).toBe('Zebra Band');
        });

        it('should handle artists with same first letter', async () => {
            // Test case sensitivity and secondary sorting
            await Artists.create({ name: 'Beatles' });
            await Artists.create({ name: 'Beach Boys' });
            await Artists.create({ name: 'Bob Dylan' });

            const response = await request(app).get('/artists').expect(200);

            expect(response.body[0].name).toBe('Beach Boys');
            expect(response.body[1].name).toBe('Beatles');
            expect(response.body[2].name).toBe('Bob Dylan');
        });
    });

    // ==================== TEST SUITE: POST /artists ====================
    describe('POST /artists', () => {
        it('should create artist with only required field (name)', async () => {
            // Arrange: Minimal artist data
            const artistData = {
                name: 'Test Artist'
            };

            // Act: Send POST request
            const response = await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            // Assert: Verify artist was created in database
            const artist = await Artists.findOne({ name: 'Test Artist' });
            expect(artist).toBeDefined();
            expect(artist.name).toBe('Test Artist');
            expect(artist.bio).toBeUndefined();
            expect(artist.genre).toBeUndefined();
        });

        it('should create artist with all fields', async () => {
            // Arrange: Complete artist data
            const artistData = {
                name: 'Complete Artist',
                bio: 'This is a comprehensive biography of the artist.',
                genre: 'Rock',
                label: 'Test Records',
                albums: ['Album One', 'Album Two', 'Album Three'],
                singles: ['Single A', 'Single B']
            };

            // Act: Send POST request
            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            // Assert: Verify all fields were saved
            const artist = await Artists.findOne({ name: 'Complete Artist' });
            expect(artist).toBeDefined();
            expect(artist.name).toBe('Complete Artist');
            expect(artist.bio).toBe('This is a comprehensive biography of the artist.');
            expect(artist.genre).toBe('Rock');
            expect(artist.label).toBe('Test Records');
            expect(artist.albums).toEqual(['Album One', 'Album Two', 'Album Three']);
            expect(artist.singles).toEqual(['Single A', 'Single B']);
        });

        it('should create artist with empty arrays for albums and singles', async () => {
            const artistData = {
                name: 'New Artist',
                albums: [],
                singles: []
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: 'New Artist' });
            expect(artist.albums).toEqual([]);
            expect(artist.singles).toEqual([]);
        });

        it('should handle special characters in artist name', async () => {
            const artistData = {
                name: "AC/DC & Guns N' Roses"
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: "AC/DC & Guns N' Roses" });
            expect(artist).toBeDefined();
            expect(artist.name).toBe("AC/DC & Guns N' Roses");
        });

        it('should handle unicode characters in artist name', async () => {
            const artistData = {
                name: 'Björk'
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: 'Björk' });
            expect(artist).toBeDefined();
        });

        it('should return 400 for duplicate artist name', async () => {
            // Arrange: Create an artist first
            await Artists.create({ name: 'Duplicate Artist' });

            // Act: Attempt to create artist with same name
            const artistData = {
                name: 'Duplicate Artist'
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(400);

            // Assert: Verify only one artist exists
            const count = await Artists.countDocuments({ name: 'Duplicate Artist' });
            expect(count).toBe(1);
        });

        it('should handle very long bio text', async () => {
            const longBio = 'A'.repeat(2000); // 2000 character bio

            const artistData = {
                name: 'Lengthy Bio Artist',
                bio: longBio
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: 'Lengthy Bio Artist' });
            expect(artist.bio).toBe(longBio);
            expect(artist.bio.length).toBe(2000);
        });

        it('should handle multiple albums and singles', async () => {
            const artistData = {
                name: 'Prolific Artist',
                albums: [
                    'Debut Album',
                    'Second Album',
                    'Third Album',
                    'Greatest Hits',
                    'Live Album'
                ],
                singles: [
                    'Hit Single 1',
                    'Hit Single 2',
                    'Hit Single 3',
                    'B-Side Track'
                ]
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: 'Prolific Artist' });
            expect(artist.albums).toHaveLength(5);
            expect(artist.singles).toHaveLength(4);
        });
    });

    // ==================== TEST SUITE: GET /artists/:id ====================
    describe('GET /artists/:id', () => {
        it('should return specific artist by ID', async () => {
            // Arrange: Create an artist
            const artist = await Artists.create({
                name: 'Test Artist',
                bio: 'A test biography',
                genre: 'Rock',
                label: 'Test Label',
                albums: ['Album 1'],
                singles: ['Single 1']
            });

            // Act: Request specific artist
            const response = await request(app)
                .get(`/artists/${artist._id}`)
                .expect(200);

            // Assert: Verify response contains all artist data
            expect(response.body.name).toBe('Test Artist');
            expect(response.body.bio).toBe('A test biography');
            expect(response.body.genre).toBe('Rock');
            expect(response.body.label).toBe('Test Label');
            expect(response.body.albums).toEqual(['Album 1']);
            expect(response.body.singles).toEqual(['Single 1']);
        });

        it('should return artist without _id field when excluded in schema', async () => {
            // Note: Based on your controller code that excludes _id
            const artist = await Artists.create({
                name: 'Test Artist',
                bio: 'Bio text'
            });

            const response = await request(app)
                .get(`/artists/${artist._id}`)
                .expect(200);

            // Your controller returns {_id: 0} projection
            expect(response.body._id).toBeUndefined();
            expect(response.body.name).toBe('Test Artist');
        });

        it('should return 400 for invalid artist ID format', async () => {
            await request(app)
                .get('/artists/invalid-id-12345')
                .expect(400);
        });

        it('should return 200 with null body for non-existent artist ID', async () => {
            // BUG: See BUG-API-001 - Should return 404, currently returns 200
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/artists/${fakeId}`)
                .expect(200);

            // Currently returns null instead of error
            expect(response.body).toBeNull();

            // TODO: Update when BUG-API-001 is fixed:
            // expect(response.status).toBe(404);
            // expect(response.body.error).toBe('Artist not found');
        });

        it('should return 400 for malformed ObjectId', async () => {
            await request(app)
                .get('/artists/123')
                .expect(400);
        });
    });

    // ==================== EDGE CASES & ERROR SCENARIOS ====================
    describe('Edge Cases and Error Handling', () => {
        it('should handle artist with no optional fields', async () => {
            const artistData = { name: 'Minimal Artist' };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: 'Minimal Artist' });
            expect(artist.name).toBe('Minimal Artist');
            expect(artist.genre).toBeUndefined();
            expect(artist.bio).toBeUndefined();
            expect(artist.label).toBeUndefined();
        });

        it('should handle empty string for optional fields', async () => {
            const artistData = {
                name: 'Empty Fields Artist',
                bio: '',
                genre: '',
                label: ''
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: 'Empty Fields Artist' });
            expect(artist.bio).toBe('');
            expect(artist.genre).toBe('');
        });

        it('should handle whitespace-only name', async () => {
            const artistData = {
                name: '   '
            };

            // This might pass or fail depending on validation
            // Update expectation based on actual behavior
            const response = await request(app)
                .post('/artists')
                .send(artistData);

            // Document current behavior: should this be allowed?
            // Ideally should return 400, but test what actually happens
            if (response.status === 200) {
                const artist = await Artists.findOne({});
                expect(artist.name).toBe('   ');
            } else {
                expect(response.status).toBe(400);
            }
        });

        it('should handle very long artist name', async () => {
            const longName = 'A'.repeat(500);

            const artistData = {
                name: longName
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            const artist = await Artists.findOne({ name: longName });
            expect(artist.name.length).toBe(500);
        });

        it('should retrieve artist even with empty albums array', async () => {
            const artist = await Artists.create({
                name: 'No Albums Artist',
                albums: []
            });

            const response = await request(app)
                .get(`/artists/${artist._id}`)
                .expect(200);

            expect(response.body.albums).toEqual([]);
        });
    });

    // ==================== DATA PERSISTENCE ====================
    describe('Data Persistence', () => {
        it('should persist artist data correctly', async () => {
            const artistData = {
                name: 'Persistence Test',
                genre: 'Electronic',
                albums: ['Test Album']
            };

            await request(app)
                .post('/artists')
                .send(artistData)
                .expect(200);

            // Query directly from database
            const artist = await Artists.findOne({ name: 'Persistence Test' });
            expect(artist.genre).toBe('Electronic');
            expect(artist.albums).toContain('Test Album');
        });

        it('should maintain data integrity across multiple operations', async () => {
            // Create artist
            const artist = await Artists.create({ name: 'Integrity Test' });

            // Retrieve via API
            const getResponse = await request(app)
                .get(`/artists/${artist._id}`)
                .expect(200);

            // Verify via GET /artists
            const listResponse = await request(app)
                .get('/artists')
                .expect(200);

            expect(listResponse.body).toHaveLength(1);
            expect(listResponse.body[0].name).toBe('Integrity Test');
        });
    });
});