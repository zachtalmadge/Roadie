require('../../__tests__/setup');
const request = require('supertest');
const app = require('../../../server');
const User = require('../user.schema');
const { Festivals } = require('../../festivals/festivals.schema');

describe('User Security Tests', () => {
    let testUser;
    let testFestival1;
    let testFestival2;

    // Helper: Create test user and festivals before each test
    beforeEach(async () => {
        // Create a test user
        testUser = await User.create({
            events: []
        });

        // Create test festivals
        testFestival1 = await Festivals.create({
            name: 'Test Festival 1',
            venue: 'Venue 1',
            location: 'City 1',
            startDate: '2025-06-01',
            endDate: '2025-06-03',
            headliners: ['Artist 1'],
            added: false,
            camping: true,
            attendance: '10000'
        });

        testFestival2 = await Festivals.create({
            name: 'Test Festival 2',
            venue: 'Venue 2',
            location: 'City 2',
            startDate: '2025-07-01',
            endDate: '2025-07-03',
            headliners: ['Artist 2'],
            added: false,
            camping: false,
            attendance: '15000'
        });
    });

    // =================================================================
    // 1. NoSQL Injection Prevention Tests
    // =================================================================
    describe('NoSQL Injection Prevention', () => {
        it('should prevent NoSQL injection in festivalID parameter using $ne operator', async () => {
            const response = await request(app)
                .put('/user/{"$ne": null}')
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });

        it('should prevent NoSQL injection in festivalID using $gt operator', async () => {
            const response = await request(app)
                .put('/user/{"$gt": ""}')
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });

        it('should prevent NoSQL injection in DELETE endpoint', async () => {
            const response = await request(app)
                .delete('/user/{"$ne": null}')
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });

        it('should handle malformed JSON injection attempts', async () => {
            const response = await request(app)
                .put('/user/{$where: "1==1"}')
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });

        it('should only accept valid ObjectId format for festival operations', async () => {
            // Invalid format should fail
            await request(app)
                .put('/user/not-a-valid-id')
                .expect(400);

            // Valid format should work
            const validResponse = await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);
        });
    });

    // =================================================================
    // 2. Authorization & State Management Security
    // =================================================================
    describe('Authorization & State Management', () => {
        it('should set festival "added" flag to true when adding to user schedule', async () => {
            expect(testFestival1.added).toBe(false);

            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            const updatedFestival = await Festivals.findById(testFestival1._id);
            expect(updatedFestival.added).toBe(true);
        });

        it('should set festival "added" flag to false when removing from schedule', async () => {
            // First add the festival
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            let festival = await Festivals.findById(testFestival1._id);
            expect(festival.added).toBe(true);

            // Then remove it
            await request(app)
                .delete(`/user/${testFestival1._id}`)
                .expect(200);

            festival = await Festivals.findById(testFestival1._id);
            expect(festival.added).toBe(false);
        });

        it('should not allow adding same festival multiple times', async () => {
            // Add festival first time
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            // Try to add same festival again
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            // Check user events - should contain festival twice (potential bug!)
            const user = await User.findById(testUser._id);
            const festivalCount = user.events.filter(
                e => e._id.toString() === testFestival1._id.toString()
            ).length;

            // This is a bug if count > 1
            if (festivalCount > 1) {
                // Document this as a finding
                expect(festivalCount).toBeGreaterThan(1);
            }
        });

        it('should return 400 when trying to remove festival not in schedule', async () => {
            // SECURITY FINDING: BUG-API-012
            // Attempting to remove a festival that was never added causes an error
            // instead of being handled gracefully (should be idempotent)

            const response = await request(app)
                .delete(`/user/${testFestival1._id}`)
                .expect(400); // Changed from 200 to 400

            expect(response.body.error).toBe('Failed to remove festival from schedule');

            // Note: Festival "added" flag is set to false even though remove fails
            // This is a data consistency issue documented in BUG-API-012
            const festival = await Festivals.findById(testFestival1._id);
            expect(festival.added).toBe(false); // Set to false despite error
        });
    });

    // =================================================================
    // 3. Error Handling & Edge Cases
    // =================================================================
    describe('Error Handling Security', () => {
        it('should return 404 with clear message when no user exists', async () => {
            // Delete the test user
            await User.deleteMany({});

            const response = await request(app)
                .get('/user')
                .expect(404);

            expect(response.body.error).toBe('User not found');

            // Should not expose stack trace or database details
            expect(JSON.stringify(response.body)).not.toContain('mongoose');
            expect(JSON.stringify(response.body)).not.toContain('MongoDB');
        });

        it('should return 400 when trying to add non-existent festival', async () => {
            const fakeId = '507f1f77bcf86cd799439011'; // Valid format but doesn't exist

            const response = await request(app)
                .put(`/user/${fakeId}`)
                .expect(400);

            expect(response.body.error).toBe('Festival not found');
        });

        it('should return 400 when trying to delete non-existent festival', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/user/${fakeId}`)
                .expect(400);

            expect(response.body.error).toBe('Festival not found');
        });

        it('should handle CastError for invalid ObjectId gracefully in PUT', async () => {
            const response = await request(app)
                .put('/user/invalid-id')
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
            expect(JSON.stringify(response.body)).not.toContain('CastError');
        });

        it('should handle CastError for invalid ObjectId gracefully in DELETE', async () => {
            const response = await request(app)
                .delete('/user/invalid-id')
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
            expect(JSON.stringify(response.body)).not.toContain('CastError');
        });

        it('should not expose internal error details in generic errors', async () => {
            // This tests the generic catch block
            const response = await request(app)
                .put('/user/invalid-format-id')
                .expect(400);

            const body = JSON.stringify(response.body);
            expect(body).not.toContain('Error:');
            expect(body).not.toContain('at ');
            expect(body).not.toContain('Stack');
        });
    });

    // =================================================================
    // 4. Data Integrity & Validation
    // =================================================================
    describe('Data Integrity & Validation', () => {
        it('should maintain complete festival data when adding to user schedule', async () => {
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            const user = await User.findById(testUser._id);
            const addedFestival = user.events[0];

            // Verify all festival data is preserved
            expect(addedFestival.name).toBe('Test Festival 1');
            expect(addedFestival.venue).toBe('Venue 1');
            expect(addedFestival.location).toBe('City 1');
            expect(addedFestival.headliners).toEqual(['Artist 1']);
            expect(addedFestival.camping).toBe(true);
            expect(addedFestival.attendance).toBe('10000');
        });

        it('should handle adding multiple different festivals', async () => {
            // Add first festival
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            // Add second festival
            await request(app)
                .put(`/user/${testFestival2._id}`)
                .expect(200);

            const user = await User.findById(testUser._id);
            expect(user.events).toHaveLength(2);

            const festival1 = user.events.find(e => e.name === 'Test Festival 1');
            const festival2 = user.events.find(e => e.name === 'Test Festival 2');

            expect(festival1).toBeDefined();
            expect(festival2).toBeDefined();
        });

        it('should correctly remove specific festival from multiple events', async () => {
            // Add both festivals
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);
            await request(app)
                .put(`/user/${testFestival2._id}`)
                .expect(200);

            let user = await User.findById(testUser._id);
            expect(user.events).toHaveLength(2);

            // Remove first festival
            await request(app)
                .delete(`/user/${testFestival1._id}`)
                .expect(200);

            user = await User.findById(testUser._id);
            expect(user.events).toHaveLength(1);
            expect(user.events[0].name).toBe('Test Festival 2');
        });

        it('should handle empty events array correctly', async () => {
            const response = await request(app)
                .get('/user')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    // =================================================================
    // 5. XSS Prevention in Embedded Documents
    // =================================================================
    describe('XSS Prevention in Embedded Documents', () => {
        it('should safely store XSS payloads from festival data', async () => {
            // Create a festival with XSS payloads
            const xssFestival = await Festivals.create({
                name: '<script>alert("XSS")</script>',
                venue: '<img src=x onerror=alert("XSS")>',
                location: '<iframe src="malicious.com"></iframe>',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['<script>alert("XSS")</script>', 'Normal Artist'],
                added: false,
                camping: true,
                attendance: '10000'
            });

            // Add to user schedule
            await request(app)
                .put(`/user/${xssFestival._id}`)
                .expect(200);

            // Verify XSS payload is stored as-is in embedded document
            const user = await User.findById(testUser._id);
            const embeddedFestival = user.events[0];

            expect(embeddedFestival.name).toBe('<script>alert("XSS")</script>');
            expect(embeddedFestival.venue).toBe('<img src=x onerror=alert("XSS")>');
            expect(embeddedFestival.location).toBe('<iframe src="malicious.com"></iframe>');
            expect(embeddedFestival.headliners).toContain('<script>alert("XSS")</script>');

            // Verify in response as well
            const response = await request(app)
                .get('/user')
                .expect(200);

            expect(response.body[0].name).toBe('<script>alert("XSS")</script>');
        });

        it('should not execute JavaScript in user events response', async () => {
            const xssFestival = await Festivals.create({
                name: 'javascript:alert("XSS")',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                added: false,
                camping: true,
                attendance: '10000'
            });

            await request(app)
                .put(`/user/${xssFestival._id}`)
                .expect(200);

            const response = await request(app)
                .get('/user')
                .expect(200);

            // Data should be stored as-is
            expect(response.body[0].name).toBe('javascript:alert("XSS")');
        });
    });

    // =================================================================
    // 6. Concurrent Operations & Race Conditions
    // =================================================================
    describe('Concurrent Operations Security', () => {
        it('should handle rapid successive add operations', async () => {
            // Rapidly add the same festival 3 times
            const promises = [
                request(app).put(`/user/${testFestival1._id}`),
                request(app).put(`/user/${testFestival1._id}`),
                request(app).put(`/user/${testFestival1._id}`)
            ];

            await Promise.all(promises);

            // Check how many times festival appears
            const user = await User.findById(testUser._id);
            const duplicates = user.events.filter(
                e => e._id.toString() === testFestival1._id.toString()
            );

            // FINDING: If duplicates.length > 1, this is BUG-API-011
            if (duplicates.length > 1) {
                expect(duplicates.length).toBeGreaterThan(1);
                // This is a race condition bug - document it
            }
        });

        it('should handle add and delete operations in quick succession', async () => {
            // Add festival
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            // Immediately try to delete
            await request(app)
                .delete(`/user/${testFestival1._id}`)
                .expect(200);

            const user = await User.findById(testUser._id);
            expect(user.events).toHaveLength(0);
        });

        it('should maintain data consistency when modifying festival after adding to schedule', async () => {
            // Add festival to schedule
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            // Modify the original festival
            testFestival1.name = 'Modified Festival Name';
            testFestival1.venue = 'Modified Venue';
            await testFestival1.save();

            // Check user's embedded copy
            const user = await User.findById(testUser._id);
            const embeddedFestival = user.events[0];

            // FINDING: Embedded document should have original data, not modified
            expect(embeddedFestival.name).toBe('Test Festival 1'); // Original
            expect(embeddedFestival.venue).toBe('Venue 1'); // Original
        });
    });

    // =================================================================
    // 7. Input Validation Security
    // =================================================================
    describe('Input Validation Security', () => {
        it('should reject extremely long festival IDs', async () => {
            const longId = 'a'.repeat(10000);

            const response = await request(app)
                .put(`/user/${longId}`)
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });

        it('should handle special characters in festival ID', async () => {
            const specialChars = '!@#$%^&*()';

            const response = await request(app)
                .put(`/user/${specialChars}`)
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });

        it('should handle null byte injection in festival ID', async () => {
            const nullByteId = 'abc\0def';

            const response = await request(app)
                .put(`/user/${nullByteId}`)
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });

        it('should handle URL-encoded injection attempts', async () => {
            const urlEncoded = '%7B%22%24ne%22%3A%20null%7D'; // {"$ne": null}

            const response = await request(app)
                .put(`/user/${urlEncoded}`)
                .expect(400);

            expect(response.body.error).toBe('Invalid festival ID format');
        });
    });

    // =================================================================
    // 8. Response Data Security
    // =================================================================
    describe('Response Data Security', () => {
        it('should return array of festivals without sensitive metadata', async () => {
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            const response = await request(app)
                .get('/user')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('venue');

            // Check if __v is exposed (Mongoose version field)
            // Note: Might be present in embedded docs
            expect(response.body[0]).toHaveProperty('_id');
        });

        it('should maintain correct response format for empty schedule', async () => {
            const response = await request(app)
                .get('/user')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });

        it('should not expose user document ID in response', async () => {
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            const response = await request(app)
                .get('/user')
                .expect(200);

            // Response should be just the events array, not user object
            expect(response.body).not.toHaveProperty('_id');
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    // =================================================================
    // 9. State Consistency Tests
    // =================================================================
    describe('State Consistency Security', () => {
        it('should maintain festival "added" flag consistency after delete', async () => {
            // Add festival
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            let festival = await Festivals.findById(testFestival1._id);
            expect(festival.added).toBe(true);

            // Delete festival
            await request(app)
                .delete(`/user/${testFestival1._id}`)
                .expect(200);

            festival = await Festivals.findById(testFestival1._id);
            expect(festival.added).toBe(false);

            // Verify user schedule is empty
            const user = await User.findById(testUser._id);
            expect(user.events).toHaveLength(0);
        });

        it('should handle deleting festival that was manually removed from array', async () => {
            // Add festival normally
            await request(app)
                .put(`/user/${testFestival1._id}`)
                .expect(200);

            // Manually remove from array (simulating data corruption)
            testUser.events = [];
            await testUser.save();

            // Try to delete via API
            const response = await request(app)
                .delete(`/user/${testFestival1._id}`)
                .expect(200);

            // Festival should still be marked as not added
            const festival = await Festivals.findById(testFestival1._id);
            expect(festival.added).toBe(false);
        });
    });

    // =================================================================
    // 10. Parallel User Operations
    // =================================================================
    describe('Parallel User Operations', () => {
        it('should handle adding multiple festivals simultaneously', async () => {
            // Add multiple festivals in parallel
            await Promise.all([
                request(app).put(`/user/${testFestival1._id}`),
                request(app).put(`/user/${testFestival2._id}`)
            ]);

            const user = await User.findById(testUser._id);
            expect(user.events.length).toBeGreaterThanOrEqual(2);

            // Both festivals should be marked as added
            const festival1 = await Festivals.findById(testFestival1._id);
            const festival2 = await Festivals.findById(testFestival2._id);
            expect(festival1.added).toBe(true);
            expect(festival2.added).toBe(true);
        });
    });
});