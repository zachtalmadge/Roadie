require('../../__tests__/setup'); // This runs the DB setup automatically
const request = require('supertest');
const app = require('../../../server'); // Adjust path to your server file
const { Festivals } = require('../festivals.schema'); // Adjust path

describe('Festivals Security Tests', () => {
    // No beforeAll/afterAll needed - setup.js handles it!
    // No afterEach for cleanup needed - setup.js handles it!

    // =================================================================
    // 1. XSS (Cross-Site Scripting) Prevention Tests
    // =================================================================
    describe('XSS Prevention', () => {
        it('should safely store script tags in festival name without execution', async () => {
            const xssPayload = {
                name: '<script>alert("XSS")</script>',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                camping: true,
                attendance: '10000'
            };

            const response = await request(app)
                .post('/festivals')
                .send(xssPayload)
                .expect(200);

            // Verify data was stored as-is (backend doesn't sanitize)
            const festival = await Festivals.findOne({ name: xssPayload.name });
            expect(festival).toBeTruthy();
            expect(festival.name).toBe('<script>alert("XSS")</script>');
            // Note: Frontend (React) should sanitize on display
        });

        it('should safely store image XSS payload in venue field', async () => {
            const imgXssPayload = {
                name: 'Test Festival',
                venue: '<img src=x onerror=alert("XSS")>',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                camping: false,
                attendance: '5000'
            };

            await request(app)
                .post('/festivals')
                .send(imgXssPayload)
                .expect(200);

            const festival = await Festivals.findOne({ venue: imgXssPayload.venue });
            expect(festival.venue).toBe('<img src=x onerror=alert("XSS")>');
        });

        it('should safely store iframe injection attempt in location', async () => {
            const iframePayload = {
                name: 'Test Festival',
                venue: 'Test Venue',
                location: '<iframe src="malicious.com"></iframe>',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                camping: true,
                attendance: '15000'
            };

            await request(app)
                .post('/festivals')
                .send(iframePayload)
                .expect(200);

            const festival = await Festivals.findOne({ location: iframePayload.location });
            expect(festival.location).toBe('<iframe src="malicious.com"></iframe>');
        });

        it('should safely store javascript protocol in headliners', async () => {
            const jsPayload = {
                name: 'Test Festival',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['javascript:alert("XSS")', 'Normal Artist'],
                camping: false,
                attendance: '20000'
            };

            await request(app)
                .post('/festivals')
                .send(jsPayload)
                .expect(200);

            const festival = await Festivals.findOne({ name: jsPayload.name });
            expect(festival.headliners).toContain('javascript:alert("XSS")');
        });

        it('should safely store HTML entities in multiple fields', async () => {
            const htmlEntitiesPayload = {
                name: 'Test & <Festival>',
                venue: 'Venue "with" quotes',
                location: "City's Location",
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist <1>', 'Artist & Band'],
                camping: true,
                attendance: '8000'
            };

            await request(app)
                .post('/festivals')
                .send(htmlEntitiesPayload)
                .expect(200);

            const festival = await Festivals.findOne({ name: htmlEntitiesPayload.name });
            expect(festival.name).toBe('Test & <Festival>');
            expect(festival.venue).toBe('Venue "with" quotes');
            expect(festival.headliners).toEqual(['Artist <1>', 'Artist & Band']);
        });
    });

    // =================================================================
    // 2. NoSQL Injection Prevention Tests
    // =================================================================
    describe('NoSQL Injection Prevention', () => {
        beforeEach(async () => {
            // Create test festivals for injection attempts
            await Festivals.create([
                {
                    name: 'Festival 1',
                    venue: 'Venue 1',
                    location: 'City 1',
                    startDate: '2025-06-01',
                    endDate: '2025-06-03',
                    headliners: ['Artist 1'],
                    camping: true,
                    attendance: '10000'
                },
                {
                    name: 'Festival 2',
                    venue: 'Venue 2',
                    location: 'City 2',
                    startDate: '2025-07-01',
                    endDate: '2025-07-03',
                    headliners: ['Artist 2'],
                    camping: false,
                    attendance: '15000'
                }
            ]);
        });

        it('should prevent NoSQL injection in ID parameter using $ne operator', async () => {
            // Attempt to bypass ID check with {"$ne": null} to return all records
            const response = await request(app)
                .get('/festivals/{"$ne": null}')
                .expect(400);

            // Should fail, not return all festivals
        });

        it('should prevent NoSQL injection in ID parameter using $gt operator', async () => {
            const response = await request(app)
                .get('/festivals/{"$gt": ""}')
                .expect(400);

            // Should fail due to invalid ObjectId format
        });

        it('should handle malformed JSON injection attempts', async () => {
            const response = await request(app)
                .get('/festivals/{$where: "1==1"}')
                .expect(400);

            // Mongoose should reject this
        });

        it('should only accept valid ObjectId format for findOne', async () => {
            const validFestival = await Festivals.findOne({});
            const validId = validFestival._id.toString();

            // Valid ObjectId should work
            const validResponse = await request(app)
                .get(`/festivals/${validId}`)
                .expect(200);

            expect(validResponse.body._id).toBe(validId);
        });
    });

    // =================================================================
    // 3. Mass Assignment Vulnerability Tests
    // =================================================================
    describe('Mass Assignment Prevention', () => {
        it('should not allow setting "added" flag to true during festival creation', async () => {
            const festivalData = {
                name: 'Malicious Festival',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                added: true, // Attempting to set protected field
                camping: true,
                attendance: '10000'
            };

            await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({ name: 'Malicious Festival' });

            // "added" should be false regardless of what user sent
            expect(festival.added).toBe(false);
        });

        it('should ignore additional fields not in schema', async () => {
            const festivalData = {
                name: 'Test Festival',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                camping: true,
                attendance: '10000',
                isAdmin: true, // Field not in schema
                privileged: true, // Field not in schema
                secretKey: 'abc123' // Field not in schema
            };

            await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({ name: 'Test Festival' }).lean();

            // Extra fields should not exist
            expect(festival.isAdmin).toBeUndefined();
            expect(festival.privileged).toBeUndefined();
            expect(festival.secretKey).toBeUndefined();
        });
    });

    // =================================================================
    // 4. Input Validation & Edge Cases
    // =================================================================
    describe('Input Validation Security', () => {
        it('should handle extremely long strings without causing issues', async () => {
            const longString = 'A'.repeat(10000);
            const festivalData = {
                name: longString,
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                camping: true,
                attendance: '10000'
            };

            const response = await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({ venue: 'Test Venue' });
            expect(festival.name.length).toBe(10000);
        });

        it('should handle array of extremely long headliner names', async () => {
            const longHeadliners = Array(100).fill('Artist Name '.repeat(50));
            const festivalData = {
                name: 'Test Festival',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: longHeadliners,
                camping: true,
                attendance: '10000'
            };

            await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({ name: 'Test Festival' });
            expect(festival.headliners).toHaveLength(100);
        });

        it('should handle special Unicode characters', async () => {
            const festivalData = {
                name: 'Festival 🎵🎸🎤',
                venue: 'Venue Ñoño',
                location: '北京市',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Артист 1', 'مغني 2', '歌手 3'],
                camping: true,
                attendance: '10000'
            };

            await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({ name: festivalData.name });
            expect(festival.name).toBe('Festival 🎵🎸🎤');
            expect(festival.location).toBe('北京市');
        });

        it('should handle null byte injection attempts', async () => {
            const festivalData = {
                name: 'Test\0Festival',
                venue: 'Test Venue\0',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist\0One'],
                camping: true,
                attendance: '10000'
            };

            await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({});
            expect(festival.name).toContain('Test');
        });
    });

    // =================================================================
    // 5. Error Handling & Information Disclosure
    // =================================================================
    describe('Error Handling Security', () => {
        it('should return 400 without exposing stack traces for invalid ObjectId', async () => {
            const response = await request(app)
                .get('/festivals/invalid-id-format')
                .expect(400);

            // Response should not contain sensitive error information
            const responseText = JSON.stringify(response.body);
            expect(responseText).not.toContain('Error:');
            expect(responseText).not.toContain('at ');
            expect(responseText).not.toContain('mongoose');
        });

        it('should return 400 without exposing database details on invalid data', async () => {
            const invalidData = {
                // Missing required fields
                name: 'Test Festival'
            };

            const response = await request(app)
                .post('/festivals')
                .send(invalidData)
                .expect(400);

            // Should not expose internal error messages
            const responseText = JSON.stringify(response.body);
            expect(responseText).not.toContain('ValidationError');
            expect(responseText).not.toContain('required');
        });

        it('should handle malformed request body gracefully', async () => {
            const response = await request(app)
                .post('/festivals')
                .set('Content-Type', 'application/json')
                .send('{"invalid json"}')
                .expect(400);

            // Should handle parsing error without exposing details
        });
    });

    // =================================================================
    // 6. Data Type Validation
    // =================================================================
    describe('Data Type Security', () => {
        it('should reject invalid date formats that could cause issues', async () => {
            const festivalData = {
                name: 'Test Festival',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: 'not-a-date',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                camping: true,
                attendance: '10000'
            };

            const response = await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(400);
        });

        it('should handle type coercion attempts in boolean fields', async () => {
            const festivalData = {
                name: 'Test Festival',
                venue: 'Test Venue',
                location: 'Test City',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                headliners: ['Artist 1'],
                camping: 'true', // String instead of boolean
                attendance: '10000'
            };

            await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({ name: 'Test Festival' });
            // Mongoose coerces 'true' string to boolean true
            expect(typeof festival.camping).toBe('boolean');
        });

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

            // FINDING: Mongoose coerces single string to array [string]
            // This is permissive behavior that may not be desired
            const response = await request(app)
                .post('/festivals')
                .send(festivalData)
                .expect(200);

            const festival = await Festivals.findOne({ name: 'Test Festival' });

            // Verify Mongoose converted string to single-element array
            expect(Array.isArray(festival.headliners)).toBe(true);
            expect(festival.headliners).toEqual(['Single Artist']);
            expect(festival.headliners.length).toBe(1);
        });
    });
});