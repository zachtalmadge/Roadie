# Test Strategy - Roadie Music Festival Discovery App

**Version:** 1.0  
**Date:** October 27, 2025  
**Author:** Zach Talmadge  
**Project:** Roadie - Music Festival & Artist Discovery Platform

---

## Table of Contents

1. [Overview](#1-overview)
2. [Testing Approach](#2-testing-approach)
3. [Unit Testing Strategy](#3-unit-testing-strategy)
4. [Integration Testing Strategy](#4-integration-testing-strategy)
5. [End-to-End Testing Strategy](#5-end-to-end-testing-strategy)
6. [Manual Testing Strategy](#6-manual-testing-strategy)
7. [Test Data Management](#7-test-data-management)
8. [Test Automation Framework](#8-test-automation-framework)
9. [Continuous Integration](#9-continuous-integration)
10. [Performance Testing Considerations](#10-performance-testing-considerations)
11. [Security Testing Strategy](#11-security-testing-strategy)
12. [Accessibility Testing](#12-accessibility-testing)
13. [Test Metrics and Reporting](#13-test-metrics-and-reporting)

---

## 1. Overview

### 1.1 Purpose
This document defines the detailed testing strategy for the Roadie application, outlining specific methodologies, techniques, and best practices for each testing level. It serves as a technical guide for implementing comprehensive test coverage across the MERN stack application.

### 1.2 Strategy Goals
- Achieve high confidence in application quality through systematic testing
- Establish repeatable, maintainable test suites
- Catch defects early in the development cycle
- Demonstrate professional QA practices for portfolio purposes
- Create a foundation for future CI/CD integration

### 1.3 Testing Philosophy
Our testing approach follows these core principles:
- **Test Pyramid:** Many fast unit tests, fewer integration tests, minimal E2E tests
- **Shift-Left:** Test early and often during development
- **Risk-Based:** Prioritize testing high-risk areas (user inputs, data validation)
- **Automation-First:** Automate repetitive tests, manual test for exploration
- **Quality Culture:** Testing is integral to development, not an afterthought

---

## 2. Testing Approach

### 2.1 Test Levels Overview
```
┌─────────────────────────────────────────────┐
│           E2E Tests (Cypress)               │  ← 8-10 critical user flows
│         User perspective, full stack        │
└─────────────────────────────────────────────┘
              ↓ Integration
┌─────────────────────────────────────────────┐
│      Integration Tests (Jest + Supertest)   │  ← All API endpoints
│       API contracts, database operations    │
└─────────────────────────────────────────────┘
              ↓ Depends on
┌─────────────────────────────────────────────┐
│         Unit Tests (Jest + RTL)             │  ← Majority of tests
│    Components, functions, business logic    │
└─────────────────────────────────────────────┘
```

### 2.2 Testing Scope by Layer

#### Backend (Node.js/Express/MongoDB)
- **Unit Tests:** Controllers, schema validations, utility functions
- **Integration Tests:** Full API endpoints with database operations
- **Coverage Target:** 85%+

#### Frontend (React)
- **Unit Tests:** Component rendering, props, state management
- **Integration Tests:** Component interactions, API mocking
- **Coverage Target:** 75%+

#### Full Stack
- **E2E Tests:** Complete user workflows from browser to database
- **Coverage Target:** 100% of critical paths

---

## 3. Unit Testing Strategy

### 3.1 Backend Unit Testing

#### 3.1.1 Controller Testing Approach

**Objective:** Test business logic in isolation from database and HTTP concerns

**Strategy:**
- Mock database operations (Mongoose models)
- Mock request/response objects
- Focus on logic, error handling, and edge cases
- Test each controller function independently

**Example Test Structure:**
```javascript
describe('FestivalController', () => {
  describe('findFestivals', () => {
    it('should return festivals sorted by startDate', async () => {
      // Arrange: Mock Festival.find()
      // Act: Call controller function
      // Assert: Verify response and sorting
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock Festival.find() to throw error
      // Act: Call controller function
      // Assert: Verify error response
    });

    it('should return empty array when no festivals exist', async () => {
      // Arrange: Mock Festival.find() to return []
      // Act: Call controller function
      // Assert: Verify empty array response
    });
  });
});
```

**Test Coverage Checklist:**
- ✅ Happy path (valid inputs, successful operations)
- ✅ Error handling (database errors, invalid inputs)
- ✅ Edge cases (empty results, boundary values)
- ✅ Data transformation (sorting, filtering)
- ✅ Response formatting (status codes, JSON structure)

#### 3.1.2 Schema Testing Approach

**Objective:** Validate Mongoose schema validations and constraints

**Strategy:**
- Test required fields
- Test unique constraints
- Test data type validations
- Test default values
- Test schema methods (if any)

**Example Test Structure:**
```javascript
describe('FestivalSchema', () => {
  it('should require name field', async () => {
    const festival = new Festivals({ /* missing name */ });
    const error = festival.validateSync();
    expect(error.errors.name).toBeDefined();
  });

  it('should enforce unique constraint on Artist name', async () => {
    await Artists.create({ name: 'Test Artist' });
    await expect(
      Artists.create({ name: 'Test Artist' })
    ).rejects.toThrow();
  });

  it('should set added flag to false by default', () => {
    const festival = new Festivals({ /* required fields */ });
    expect(festival.added).toBe(false);
  });
});
```

**Test Coverage Checklist:**
- ✅ Required field validations
- ✅ Unique constraints (Artist name)
- ✅ Data type enforcement
- ✅ Default values (added: false)
- ✅ Array fields (headliners, albums, singles)

### 3.2 Frontend Unit Testing

#### 3.2.1 Component Testing Approach

**Objective:** Test React components in isolation with mocked dependencies

**Tools:** Jest + React Testing Library

**Strategy:**
- Render components with required props
- Test user interactions (clicks, typing)
- Test conditional rendering
- Mock API calls
- Avoid testing implementation details
- Focus on user-facing behavior

**Example Test Structure:**
```javascript
describe('FestivalCard', () => {
  const mockFestival = {
    _id: '123',
    name: 'Coachella',
    startDate: '2025-04-15',
    location: 'Indio, CA',
    added: false
  };

  it('should render festival information', () => {
    render();
    expect(screen.getByText('Coachella')).toBeInTheDocument();
    expect(screen.getByText('Indio, CA')).toBeInTheDocument();
  });

  it('should call onAddToSchedule when button clicked', () => {
    const mockOnAdd = jest.fn();
    render();
    
    fireEvent.click(screen.getByText(/add to schedule/i));
    expect(mockOnAdd).toHaveBeenCalledWith('123');
  });

  it('should show "Added" state when festival is added', () => {
    const addedFestival = { ...mockFestival, added: true };
    render();
    
    expect(screen.getByText(/added/i)).toBeInTheDocument();
    expect(screen.queryByText(/add to schedule/i)).not.toBeInTheDocument();
  });
});
```

**Test Coverage Checklist:**
- ✅ Component renders without crashing
- ✅ Props are displayed correctly
- ✅ User interactions trigger expected callbacks
- ✅ Conditional rendering based on state/props
- ✅ Accessibility attributes (aria-labels, roles)

#### 3.2.2 Form Component Testing Approach

**Objective:** Thoroughly test form validation, submission, and error handling

**Critical for Roadie:** CreateFestivalForm and CreateArtistForm are high-risk areas

**Strategy:**
- Test field-level validations
- Test form-level validations
- Test submission flow (loading, success, error states)
- Test error message display
- Test form reset after submission

**Example Test Structure:**
```javascript
describe('CreateFestivalForm', () => {
  it('should show validation error for missing required field', async () => {
    render();
    
    fireEvent.click(screen.getByText(/submit/i));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('should validate endDate is after startDate', async () => {
    render();
    
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: '2025-06-01' }
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: '2025-05-30' }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });

  it('should successfully submit valid form data', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue({ status: 200 });
    render();
    
    // Fill all required fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Festival' }
    });
    // ... fill other fields
    
    fireEvent.click(screen.getByText(/submit/i));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('should display API error message on submission failure', async () => {
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Duplicate festival'));
    render();
    
    // Fill and submit form
    
    await waitFor(() => {
      expect(screen.getByText(/duplicate festival/i)).toBeInTheDocument();
    });
  });
});
```

**Test Coverage Checklist:**
- ✅ All field validations (required, format, length)
- ✅ Cross-field validations (date logic)
- ✅ Submit button disabled during submission
- ✅ Loading state displayed during API call
- ✅ Success message and form reset on success
- ✅ Error message display on failure
- ✅ Duplicate name error handling

---

## 4. Integration Testing Strategy

### 4.1 API Integration Testing

#### 4.1.1 Objectives
- Verify complete request-response cycle
- Test API contracts (endpoints, methods, payloads)
- Validate database operations
- Test error scenarios and status codes
- Ensure data persistence

#### 4.1.2 Test Environment Setup

**Tools:** Jest + Supertest + MongoDB Memory Server

**Setup Strategy:**
```javascript
// Before all tests: Start in-memory MongoDB
beforeAll(async () => {
  await mongoose.connect(mongoServer.getUri());
});

// Before each test: Clear database
beforeEach(async () => {
  await Festivals.deleteMany({});
  await Artists.deleteMany({});
  await User.deleteMany({});
});

// After all tests: Close connections
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

#### 4.1.3 API Test Structure

**Pattern:** Arrange-Act-Assert

**Example Test Structure:**
```javascript
describe('POST /festivals', () => {
  describe('Success Cases', () => {
    it('should create festival with all required fields', async () => {
      // Arrange
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        headliners: ['Artist 1', 'Artist 2']
      };

      // Act
      const response = await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(200);

      // Assert
      const festival = await Festivals.findOne({ name: 'Test Festival' });
      expect(festival).toBeDefined();
      expect(festival.name).toBe('Test Festival');
      expect(festival.added).toBe(false);
    });

    it('should create festival with optional fields', async () => {
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        headliners: ['Artist 1'],
        camping: true,
        attendance: '50000'
      };

      const response = await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(200);

      const festival = await Festivals.findOne({ name: 'Test Festival' });
      expect(festival.camping).toBe(true);
      expect(festival.attendance).toBe('50000');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when name is missing', async () => {
      const festivalData = {
        venue: 'Test Venue',
        location: 'Test City',
        // name is missing
      };

      await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(400);
    });

    it('should return 400 when startDate is invalid format', async () => {
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: 'invalid-date',
        endDate: '2025-06-03',
        headliners: ['Artist 1']
      };

      await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(400);
    });

    it('should return 400 when headliners is empty array', async () => {
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        headliners: []
      };

      await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(400);
    });
  });

  describe('Business Logic Validation', () => {
    it('should reject endDate before startDate', async () => {
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: '2025-06-03',
        endDate: '2025-06-01', // before startDate
        headliners: ['Artist 1']
      };

      await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(400);
    });

    it('should allow single-day festival (endDate equals startDate)', async () => {
      const festivalData = {
        name: 'Test Festival',
        venue: 'Test Venue',
        location: 'Test City',
        startDate: '2025-06-01',
        endDate: '2025-06-01', // same day
        headliners: ['Artist 1']
      };

      await request(app)
        .post('/festivals')
        .send(festivalData)
        .expect(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate festival names', async () => {
      const festivalData = {
        name: 'Duplicate Festival',
        venue: 'Venue 1',
        location: 'City 1',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        headliners: ['Artist 1']
      };

      // Create first festival
      await request(app).post('/festivals').send(festivalData).expect(200);

      // Attempt to create duplicate
      await request(app).post('/festivals').send(festivalData).expect(400);
    });

    it('should handle special characters in text fields', async () => {
      const festivalData = {
        name: 'Festival alert("XSS")',
        venue: 'Venue & Location',
        location: 'City, State',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        headliners: ['Artist 1']
      };

      await request(app).post('/festivals').send(festivalData).expect(200);

      const festival = await Festivals.findOne({});
      // Verify data is stored (sanitization should happen at display layer)
      expect(festival.name).toContain('');
    });
  });
});
```

#### 4.1.4 Complete API Test Coverage

**Artists Endpoints:**
- ✅ GET /artists - returns all artists sorted alphabetically
- ✅ GET /artists - returns empty array when no artists
- ✅ POST /artists - creates artist with all fields
- ✅ POST /artists - creates artist with only name (required field)
- ✅ POST /artists - returns 400 when name is missing
- ✅ POST /artists - returns 400 for duplicate name
- ✅ POST /artists - handles empty arrays for albums/singles
- ✅ GET /artists/:id - returns specific artist
- ✅ GET /artists/:id - returns 400 for invalid ObjectId
- ✅ GET /artists/:id - returns 400 when artist not found

**Festivals Endpoints:**
- ✅ GET /festivals - returns all festivals sorted by startDate
- ✅ GET /festivals - returns empty array when no festivals
- ✅ POST /festivals - creates festival with required fields
- ✅ POST /festivals - creates festival with optional fields
- ✅ POST /festivals - returns 400 for missing required fields
- ✅ POST /festivals - validates date logic (endDate >= startDate)
- ✅ POST /festivals - handles empty headliners array
- ✅ POST /festivals - sets added flag to false
- ✅ GET /festivals/:id - returns specific festival
- ✅ GET /festivals/:id - returns 400 for invalid ObjectId
- ✅ GET /festivals/:id - returns 400 when festival not found

**User Endpoints:**
- ✅ GET /user - returns user events array
- ✅ GET /user - returns empty array when no events
- ✅ PUT /user/:festivalID - adds festival to user schedule
- ✅ PUT /user/:festivalID - updates festival.added to true
- ✅ PUT /user/:festivalID - handles invalid festival ID
- ✅ PUT /user/:festivalID - handles non-existent festival
- ✅ PUT /user/:festivalID - prevents duplicate additions (idempotency)
- ✅ DELETE /user/:festivalID - removes festival from schedule
- ✅ DELETE /user/:festivalID - updates festival.added to false
- ✅ DELETE /user/:festivalID - handles invalid festival ID
- ✅ DELETE /user/:festivalID - handles non-existent festival in schedule

---

## 5. End-to-End Testing Strategy

### 5.1 E2E Testing Objectives
- Validate complete user workflows from browser to database
- Test real user interactions in a browser environment
- Verify integration of frontend, backend, and database
- Catch issues that unit/integration tests miss
- Test critical paths that impact user experience

### 5.2 Tool Selection: Cypress

**Why Cypress:**
- ✅ Excellent developer experience
- ✅ Real browser testing
- ✅ Automatic waiting (no explicit waits needed)
- ✅ Time-travel debugging
- ✅ Screenshot and video recording on failures
- ✅ Great documentation and community support

### 5.3 E2E Test Structure

#### 5.3.1 Test Organization
```
cypress/
├── e2e/
│   ├── festivals-browse.cy.js       # Browse and view festivals
│   ├── festivals-create.cy.js       # Create new festival
│   ├── artists-browse.cy.js         # Browse and view artists
│   ├── artists-create.cy.js         # Create new artist
│   ├── user-schedule.cy.js          # Add/remove from schedule
│   └── navigation.cy.js             # Navigation flows
├── fixtures/
│   ├── artists.json                 # Test artist data
│   ├── festivals.json               # Test festival data
│   └── user.json                    # Test user data
├── support/
│   ├── commands.js                  # Custom Cypress commands
│   └── e2e.js                       # Global configuration
└── cypress.config.js                # Cypress configuration
```

#### 5.3.2 Custom Commands

**Create reusable commands for common actions:**
```javascript
// cypress/support/commands.js

// Seed database with test data
Cypress.Commands.add('seedDatabase', () => {
  cy.request('POST', '/api/test/seed', {
    artists: cy.fixture('artists.json'),
    festivals: cy.fixture('festivals.json')
  });
});

// Clear database
Cypress.Commands.add('clearDatabase', () => {
  cy.request('POST', '/api/test/clear');
});

// Navigate to specific page
Cypress.Commands.add('visitFestivals', () => {
  cy.visit('/');
  cy.get('nav').contains('Festivals').click();
});

// Add festival to schedule
Cypress.Commands.add('addToSchedule', (festivalName) => {
  cy.contains(festivalName)
    .parents('[data-testid="festival-card"]')
    .find('button')
    .contains(/add to schedule/i)
    .click();
});
```

#### 5.3.3 Critical User Flows

**Flow 1: Browse Festivals and Add to Schedule**
```javascript
describe('Festival Browsing and Scheduling', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.seedDatabase();
    cy.visit('/');
  });

  it('should browse festivals and add to schedule from list view', () => {
    // Navigate to festivals page
    cy.get('nav').contains('Festivals').click();
    cy.url().should('include', '/festivals');

    // Verify festivals are displayed
    cy.get('[data-testid="festival-card"]').should('have.length.greaterThan', 0);

    // Add first festival to schedule
    cy.get('[data-testid="festival-card"]').first().within(() => {
      cy.contains('Coachella').should('be.visible');
      cy.contains(/add to schedule/i).click();
    });

    // Verify button state changes
    cy.get('[data-testid="festival-card"]').first().within(() => {
      cy.contains(/added/i).should('be.visible');
      cy.contains(/add to schedule/i).should('not.exist');
    });

    // Navigate to My Schedule
    cy.get('nav').contains('My Schedule').click();
    cy.url().should('include', '/schedule');

    // Verify festival appears in schedule
    cy.contains('Coachella').should('be.visible');
  });

  it('should view festival details and add to schedule', () => {
    cy.visitFestivals();

    // Click "View Details" on a festival
    cy.contains('Coachella')
      .parents('[data-testid="festival-card"]')
      .contains(/view details/i)
      .click();

    // Verify on details page
    cy.url().should('include', '/festivals/');
    cy.get('h1').contains('Coachella').should('be.visible');

    // Verify festival details are displayed
    cy.contains(/venue/i).should('be.visible');
    cy.contains(/location/i).should('be.visible');
    cy.contains(/headliners/i).should('be.visible');

    // Add to schedule from details page
    cy.contains(/add to schedule/i).click();
    cy.contains(/added/i).should('be.visible');

    // Navigate to schedule and verify
    cy.get('nav').contains('My Schedule').click();
    cy.contains('Coachella').should('be.visible');
  });
});
```

**Flow 2: Create New Festival**
```javascript
describe('Create Festival', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.visit('/');
  });

  it('should create a new festival with valid data', () => {
    // Navigate to create festival page
    cy.get('nav').contains('Create Festival').click();
    cy.url().should('include', '/festivals/create');

    // Fill out form
    cy.get('input[name="name"]').type('New Test Festival');
    cy.get('input[name="venue"]').type('Test Venue');
    cy.get('input[name="location"]').type('Test City, CA');
    cy.get('input[name="startDate"]').type('2025-07-01');
    cy.get('input[name="endDate"]').type('2025-07-03');
    cy.get('input[name="headliners"]').type('Artist 1, Artist 2, Artist 3');
    cy.get('input[name="attendance"]').type('50000');
    cy.get('input[name="camping"]').check();

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify success message
    cy.contains(/festival created successfully/i).should('be.visible');

    // Verify redirected to festivals list or details
    cy.url().should('match', /\/festivals/);

    // Verify new festival appears in list
    cy.contains('New Test Festival').should('be.visible');
  });

  it('should show validation errors for invalid data', () => {
    cy.get('nav').contains('Create Festival').click();

    // Attempt to submit without required fields
    cy.get('button[type="submit"]').click();

    // Verify validation errors
    cy.contains(/name is required/i).should('be.visible');
    cy.contains(/venue is required/i).should('be.visible');
    cy.contains(/location is required/i).should('be.visible');
  });

  it('should validate endDate is after startDate', () => {
    cy.get('nav').contains('Create Festival').click();

    // Fill dates with invalid logic
    cy.get('input[name="startDate"]').type('2025-07-10');
    cy.get('input[name="endDate"]').type('2025-07-05'); // before start

    cy.get('button[type="submit"]').click();

    // Verify date validation error
    cy.contains(/end date must be after start date/i).should('be.visible');
  });
});
```

**Flow 3: Create New Artist**
```javascript
describe('Create Artist', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.visit('/');
  });

  it('should create a new artist with all fields', () => {
    cy.get('nav').contains('Create Artist').click();
    cy.url().should('include', '/artists/create');

    cy.get('input[name="name"]').type('New Test Artist');
    cy.get('select[name="genre"]').select('Rock');
    cy.get('input[name="label"]').type('Test Records');
    cy.get('textarea[name="bio"]').type('This is a test artist biography.');
    cy.get('input[name="albums"]').type('Album 1, Album 2');
    cy.get('input[name="singles"]').type('Single 1, Single 2');

    cy.get('button[type="submit"]').click();

    cy.contains(/artist created successfully/i).should('be.visible');
    cy.url().should('match', /\/artists/);
    cy.contains('New Test Artist').should('be.visible');
  });

  it('should create artist with only required field (name)', () => {
    cy.get('nav').contains('Create Artist').click();

    cy.get('input[name="name"]').type('Minimal Artist');
    cy.get('button[type="submit"]').click();

    cy.contains(/artist created successfully/i).should('be.visible');
    cy.contains('Minimal Artist').should('be.visible');
  });

  it('should show error for duplicate artist name', () => {
    // Create first artist
    cy.get('nav').contains('Create Artist').click();
    cy.get('input[name="name"]').type('Duplicate Artist');
    cy.get('button[type="submit"]').click();
    cy.contains(/success/i).should('be.visible');

    // Attempt to create duplicate
    cy.get('nav').contains('Create Artist').click();
    cy.get('input[name="name"]').type('Duplicate Artist');
    cy.get('button[type="submit"]').click();

    // Verify error message
    cy.contains(/artist already exists/i).should('be.visible');
  });
});
```

**Flow 4: Remove Festival from Schedule**
```javascript
describe('Schedule Management', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.seedDatabase();
    cy.visit('/');
  });

  it('should remove festival from schedule', () => {
    // Add festival to schedule first
    cy.visitFestivals();
    cy.addToSchedule('Coachella');

    // Go to My Schedule
    cy.get('nav').contains('My Schedule').click();
    cy.contains('Coachella').should('be.visible');

    // Remove festival
    cy.contains('Coachella')
      .parents('[data-testid="festival-card"]')
      .contains(/remove/i)
      .click();

    // Verify removed
    cy.contains('Coachella').should('not.exist');

    // Verify "added" state is reset in festivals list
    cy.visitFestivals();
    cy.contains('Coachella')
      .parents('[data-testid="festival-card"]')
      .contains(/add to schedule/i)
      .should('be.visible');
  });
});
```

**Flow 5: Artist Details Navigation**
```javascript
describe('Artist Browsing', () => {
  beforeEach(() => {
    cy.clearDatabase();
    cy.seedDatabase();
    cy.visit('/');
  });

  it('should browse artists and view details', () => {
    cy.get('nav').contains('Artists').click();
    cy.url().should('include', '/artists');

    // Verify artists are displayed and sorted
    cy.get('[data-testid="artist-card"]').should('have.length.greaterThan', 0);

    // Click on an artist to view details
    cy.contains('Test Artist')
      .parents('[data-testid="artist-card"]')
      .contains(/view details/i)
      .click();

    // Verify on artist details page
    cy.url().should('include', '/artists/');
    cy.get('h1').contains('Test Artist').should('be.visible');

    // Verify artist details are displayed
    cy.contains(/genre/i).should('be.visible');
    cy.contains(/bio/i).should('be.visible');
  });
});
```

### 5.4 E2E Test Best Practices

#### 5.4.1 Data Management
- **Always start with a clean slate:** Clear database before each test
- **Seed predictable data:** Use fixtures for consistent test data
- **Test data isolation:** Each test should be independent
- **Clean up after tests:** Remove test data after test suite

#### 5.4.2 Selectors
- **Prefer data-testid attributes:** `data-testid="festival-card"`
- **Avoid brittle selectors:** Don't rely on CSS classes or structure
- **Use semantic selectors:** Buttons, links, form elements
- **Test user-visible text:** `cy.contains('Add to Schedule')`

#### 5.4.3 Assertions
- **Verify URLs:** Ensure navigation worked
- **Verify visible elements:** Check content is displayed
- **Verify state changes:** Button text changes, items appear/disappear
- **Verify data persistence:** Check data survives page refresh

#### 5.4.4 Error Handling
- **Take screenshots on failure:** Automatically captured by Cypress
- **Record videos:** Enable for CI/CD debugging
- **Log network requests:** Monitor API calls
- **Add custom error messages:** Make failures easier to debug

---

## 6. Manual Testing Strategy

### 6.1 When to Use Manual Testing
Manual testing complements automated tests for:
- Exploratory testing (finding unexpected issues)
- Usability and UX evaluation
- Visual/aesthetic validation
- Accessibility testing
- Security testing (XSS, injection attempts)
- Cross-browser compatibility spot checks
- One-time or rarely executed scenarios

### 6.2 Exploratory Testing Sessions

**Session Structure:**
- **Duration:** 30-60 minutes per session
- **Focus:** One feature or user flow
- **Approach:** Unscripted, curious exploration
- **Documentation:** Note findings in real-time

**Exploratory Testing Charter Examples:**

**Charter 1: Festival Creation Form**
- **Mission:** Explore the festival creation form to identify usability issues and edge cases
- **Areas to Explore:**
  - Field validations
  - Date picker behavior
  - Headliners input (comma-separated vs individual)
  - Form submission with various data combinations
  - Error message clarity
  - Success feedback
- **Duration:** 45 minutes

**Charter 2: Schedule Management**
- **Mission:** Test adding/removing multiple festivals to find edge cases
- **Areas to Explore:**
  - Add multiple festivals rapidly
  - Remove and re-add same festival
  - Schedule persistence across page refreshes
  - Schedule with 0 items, 1 item, many items
  - Button state consistency
- **Duration:** 30 minutes

### 6.3 Usability Testing Checklist

**Form Usability:**
- ✅ Clear field labels
- ✅ Helpful placeholder text
- ✅ Inline validation feedback
- ✅ Error messages are specific and actionable
- ✅ Success messages are clear
- ✅ Submit button disabled during submission
- ✅ Loading indicators during async operations
- ✅ Tab order is logical
- ✅ Enter key submits form appropriately

**Navigation Usability:**
- ✅ Active nav item highlighted
- ✅ Back button works as expected
- ✅ Breadcrumbs (if applicable)
- ✅ Clear call-to-action buttons
- ✅ Consistent navigation patterns

**Data Display:**
- ✅ Dates formatted consistently
- ✅ Empty states are informative
- ✅ Loading states are clear
- ✅ Long text truncated appropriately
- ✅ Lists are scannable

### 6.4 Browser Compatibility Testing

**Primary Browser:** Chrome (most testing)
**Secondary Browsers:** Safari, Firefox (spot checks)

**Test Matrix:**

| Feature | Chrome | Safari | Firefox |
|---------|--------|--------|---------|
| Browse Festivals | ✅ | ✅ | ✅ |
| Create Festival | ✅ | ✅ | ✅ |
| Add to Schedule | ✅ | ✅ | ✅ |
| Browse Artists | ✅ | ✅ | ✅ |
| Create Artist | ✅ | ✅ | ✅ |

**Focus Areas:**
- Date picker compatibility
- Form validation behavior
- CSS rendering consistency
- JavaScript functionality

### 6.5 Responsive Design Testing

**Test Viewports:**
- Desktop: 1920x1080, 1366x768
- Tablet: 768x1024
- Mobile: 375x667, 414x896

**Responsive Checklist:**
- ✅ Navigation adapts (hamburger menu on mobile)
- ✅ Forms are usable on small screens
- ✅ Text is readable (font sizes)
- ✅ Buttons are tappable (touch targets)
- ✅ Images scale appropriately
- ✅ No horizontal scrolling
- ✅ Content reflows logically

---

## 7. Test Data Management

### 7.1 Test Data Strategy

**Principles:**
- **Realistic:** Data resembles production data
- **Controlled:** Predictable for consistent results
- **Isolated:** Each test has independent data
- **Minimal:** Only create data needed for the test
- **Reusable:** Fixtures can be shared across tests

### 7.2 Test Data Sources

#### 7.2.1 Seed Data Files
Use existing project data files as baseline:
- `data/artists.json`
- `data/events.json`
- `data/users.json`

#### 7.2.2 Test Fixtures
Create specific fixtures for testing:
```json
// cypress/fixtures/festivals.json
[
  {
    "name": "Test Festival 1",
    "venue": "Test Venue 1",
    "location": "Test City, CA",
    "startDate": "2025-06-15",
    "endDate": "2025-06-17",
    "headliners": ["Artist A", "Artist B"],
    "camping": true,
    "attendance": "30000"
  },
  {
    "name": "Test Festival 2",
    "venue": "Test Venue 2",
    "location": "Another City, NY",
    "startDate": "2025-07-20",
    "endDate": "2025-07-22",
    "headliners": ["Artist C", "Artist D"],
    "camping": false,
    "attendance": "50000"
  }
]
```

#### 7.2.3 Factory Functions
Create functions to generate test data programmatically:
```javascript
// test/factories/festivalFactory.js
const createFestival = (overrides = {}) => {
  return {
    name: 'Default Festival',
    venue: 'Default Venue',
    location: 'Default City',
    startDate: '2025-06-01',
    endDate: '2025-06-03',
    headliners: ['Default Artist'],
    camping: false,
    attendance: '10000',
    ...overrides
  };
};

// Usage
const festival1 = createFestival({ name: 'Custom Festival' });
const festival2 = createFestival({ camping: true, attendance: '50000' });
```

### 7.3 Database State Management

**Before Tests:**
- Clear all collections
- Seed with known data (if needed)
- Create required documents (e.g., single User)

**After Tests:**
- Clean up test data
- Close database connections
- Reset state for next test

**Example Setup:**
```javascript
beforeEach(async () => {
  await Festivals.deleteMany({});
  await Artists.deleteMany({});
  await User.deleteMany({});
  
  // Create single user (app requirement)
  await User.create({ events: [] });
  
  // Seed with test data if needed
  await Festivals.insertMany(testFestivals);
});
```

---

## 8. Test Automation Framework

### 8.1 Framework Architecture
```
roadie/
├── server/
│   └── src/
│       ├── artists/
│       │   └── __tests__/
│       │       ├── artists.controller.test.js    # Unit tests
│       │       └── artists.integration.test.js   # API tests
│       ├── festivals/
│       │   └── __tests__/
│       │       ├── festivals.controller.test.js
│       │       └── festivals.integration.test.js
│       └── user/
│           └── __tests__/
│               ├── user.controller.test.js
│               └── user.integration.test.js
├── client/
│   └── src/
│       ├── components/
│       │   ├── FestivalCard/
│       │   │   ├── FestivalCard.jsx
│       │   │   └── FestivalCard.test.jsx
│       │   └── CreateFestivalForm/
│       │       ├── CreateFestivalForm.jsx
│       │       └── CreateFestivalForm.test.jsx
│       └── pages/
│           ├── FestivalsPage/
│           │   ├── FestivalsPage.jsx
│           │   └── FestivalsPage.test.jsx
│           └── CreateFestivalPage/
│               ├── CreateFestivalPage.jsx
│               └── CreateFestivalPage.test.jsx
└── cypress/
    └── e2e/
        ├── festivals-browse.cy.js
        └── festivals-create.cy.js
```

### 8.2 Test Configuration

#### 8.2.1 Jest Configuration (Backend)
```javascript
// server/jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.integration.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.integration.test.js'
  ]
};
```

#### 8.2.2 Jest Configuration (Frontend)
```javascript
// client/jest.config.js (or in package.json)
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '/__mocks__/fileMock.js'
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/**/*.test.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    }
  }
};
```

#### 8.2.3 Cypress Configuration
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

### 8.3 NPM Scripts

#### 8.3.1 Backend Scripts (server/package.json)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=\\.test\\.js$",
    "test:integration": "jest --testPathPattern=\\.integration\\.test\\.js$"
  }
}
```

#### 8.3.2 Frontend Scripts (client/package.json)
```json
{
  "scripts": {
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:ci": "CI=true react-scripts test"
  }
}
```

#### 8.3.3 E2E Scripts (root package.json)
```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "start-server-and-test 'npm run dev' http://localhost:3000 'cypress run'"
  }
}
```

---

## 9. Continuous Integration

### 9.1 CI/CD Goals
While full CI/CD setup is optional for this portfolio project, the test suite is designed to be CI-ready:

**CI Pipeline Would Include:**
1. Install dependencies
2. Lint code
3. Run unit tests (backend + frontend)
4. Run integration tests
5. Generate coverage reports
6. Run E2E tests (optional in CI)
7. Build application
8. Deploy (if tests pass)

### 9.2 GitHub Actions Example (Future Implementation)
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies (backend)
        working-directory: ./server
        run: npm ci
      
      - name: Run backend tests
        working-directory: ./server
        run: npm run test:coverage
      
      - name: Install dependencies (frontend)
        working-directory: ./client
        run: npm ci
      
      - name: Run frontend tests
        working-directory: ./client
        run: npm run test:ci
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

---

## 10. Performance Testing Considerations

### 10.1 Scope for Roadie
Performance testing is **low priority** for this project given:
- Single-user application
- Small dataset
- No production deployment planned
- Portfolio/learning focus

### 10.2 Basic Performance Checks (Manual)
- ✅ Page load times feel responsive
- ✅ API responses return quickly (<500ms)
- ✅ No noticeable lag when adding/removing festivals
- ✅ Lists render efficiently with 50+ items

### 10.3 Future Performance Testing (If Needed)
Tools that could be used:
- **Lighthouse:** Web performance auditing
- **K6 or Apache JMeter:** Load testing APIs
- **React DevTools Profiler:** Component render performance

---

## 11. Security Testing Strategy

### 11.1 Security Testing Focus Areas

#### 11.1.1 Input Validation & Sanitization
**Risk:** XSS (Cross-Site Scripting) attacks via user-generated content

**Test Approach:**
1. **Manual Testing:** Attempt to inject malicious scripts
2. **Automated Testing:** Include XSS payloads in integration tests

**Test Cases:**
```javascript
describe('XSS Prevention', () => {
  it('should not execute JavaScript in festival name', async () => {
    const xssPayload = {
      name: 'alert("XSS")',
      venue: 'Test Venue',
      // ... other fields
    };

    const response = await request(app)
      .post('/festivals')
      .send(xssPayload)
      .expect(200);

    // Data should be stored (backend doesn't sanitize)
    const festival = await Festivals.findOne({});
    expect(festival.name).toContain('');
    
    // Frontend should sanitize on display (test in E2E)
  });

  it('should handle HTML entities in artist bio', async () => {
    const htmlPayload = {
      name: 'Test Artist',
      bio: 'Bold Text & Italic',
    };

    await request(app)
      .post('/artists')
      .send(htmlPayload)
      .expect(200);

    const artist = await Artists.findOne({});
    expect(artist.bio).toContain('Bold Text');
  });
});
```

**Manual Test Scenarios:**
- Input: `<script>alert('XSS')</script>` in text fields
- Input: `<img src=x onerror=alert('XSS')>` in text fields
- Input: `javascript:alert('XSS')` in text fields
- Input: `<iframe src="malicious.com"></iframe>` in text fields

**Expected Behavior:**
- Backend stores data as-is (no sanitization)
- Frontend escapes/sanitizes on display (React does this by default)
- No script execution occurs

#### 11.1.2 Injection Attacks
**Risk:** NoSQL injection (MongoDB)

**Mitigation:** Mongoose provides protection by default

**Test Approach:**
```javascript
it('should prevent NoSQL injection in query parameters', async () => {
  // Attempt injection in ID parameter
  const response = await request(app)
    .get('/festivals/{"$ne": null}')
    .expect(400);
  
  // Should not return all festivals
});
```

#### 11.1.3 Mass Assignment
**Risk:** Users could set fields they shouldn't (e.g., `added` flag directly)

**Test Approach:**
```javascript
it('should not allow setting "added" flag directly when creating festival', async () => {
  const festivalData = {
    name: 'Test Festival',
    venue: 'Test Venue',
    location: 'Test City',
    startDate: '2025-06-01',
    endDate: '2025-06-03',
    headliners: ['Artist 1'],
    added: true // User tries to set this
  };

  await request(app)
    .post('/festivals')
    .send(festivalData)
    .expect(200);

  const festival = await Festivals.findOne({ name: 'Test Festival' });
  
  // Should be false regardless of what user sent
  expect(festival.added).toBe(false);
});
```

### 11.2 Security Testing Checklist

**Input Validation:**
- ✅ XSS payloads are stored safely
- ✅ HTML entities are escaped on display
- ✅ Script tags don't execute
- ✅ SQL/NoSQL injection attempts fail
- ✅ Extremely long inputs are handled
- ✅ Special characters are handled correctly

**Data Protection:**
- ✅ Sensitive fields can't be mass-assigned
- ✅ No credentials in client-side code
- ✅ No sensitive data in error messages
- ✅ No stack traces exposed to users

**API Security:**
- ✅ Appropriate HTTP status codes
- ✅ Error messages don't reveal system internals
- ✅ Rate limiting (future consideration)
- ✅ CORS configured appropriately

## 11.3 Security Testing Implementation Status

### Festivals Endpoint - COMPLETED ✅
**File:** `__tests__/festivals.security.test.js`  
**Tests:** 21 security-focused test cases  
**Coverage:** 100% of planned security scenarios

**Test Categories:**
1. ✅ XSS Prevention (5 tests)
2. ✅ NoSQL Injection (4 tests)
3. ✅ Mass Assignment (2 tests)
4. ✅ Input Validation (4 tests)
5. ✅ Error Handling (3 tests)
6. ✅ Data Type Validation (3 tests)

**Key Findings:**
- No critical security vulnerabilities detected
- 1 minor UX bug identified (empty error responses)
- Mongoose provides effective default security
- React provides adequate XSS protection

---

### Artists Endpoint - PENDING ⏳
**Planned Tests:** ~18 security test cases  
**Similar coverage to Festivals endpoint**

### Users Endpoint - PENDING ⏳
**Planned Tests:** ~25 security test cases  
**Additional focus areas:**
- Password handling (when authentication added)
- Session security
- Personal data protection


---

## 12. Accessibility Testing

### 12.1 Accessibility Goals
Ensure Roadie is usable by people with disabilities and meets WCAG 2.1 Level AA standards (aspirational).

### 12.2 Automated Accessibility Testing

**Tool:** axe DevTools or jest-axe

**Example Test:**
```javascript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render();
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 12.3 Manual Accessibility Checklist

**Keyboard Navigation:**
- ✅ All interactive elements accessible via Tab key
- ✅ Tab order is logical
- ✅ Focus indicators are visible
- ✅ Enter/Space activates buttons/links
- ✅ Escape closes modals/dialogs
- ✅ No keyboard traps

**Screen Reader Testing:**
- ✅ Images have alt text
- ✅ Form labels are associated with inputs
- ✅ Buttons have descriptive text
- ✅ Headings are hierarchical (h1, h2, h3)
- ✅ Links have descriptive text (not "click here")
- ✅ ARIA labels used where needed

**Visual Accessibility:**
- ✅ Sufficient color contrast (4.5:1 for text)
- ✅ Color is not the only way to convey information
- ✅ Text is resizable without loss of content
- ✅ Focus indicators are visible

**Forms:**
- ✅ Required fields are marked
- ✅ Error messages are associated with fields
- ✅ Instructions are clear
- ✅ Validation errors are announced

### 12.4 Accessibility Testing Tools
- **Browser Extensions:** axe DevTools, WAVE
- **Screen Readers:** NVDA (Windows), VoiceOver (Mac)
- **Keyboard-only Testing:** Disconnect mouse and navigate

---

## 13. Test Metrics and Reporting

### 13.1 Code Coverage Metrics

**Coverage Goals:**
- **Backend:** 85%+ (lines, functions, branches)
- **Frontend:** 75%+ (lines, functions, branches)

**Coverage Reports Generated By:**
- Jest (automatic with `--coverage` flag)
- Stored in `coverage/` directories
- HTML reports viewable in browser

**Key Metrics:**
- **Line Coverage:** % of lines executed
- **Function Coverage:** % of functions called
- **Branch Coverage:** % of code branches executed
- **Statement Coverage:** % of statements executed

### 13.2 Test Execution Metrics

**Track:**
- Total number of tests
- Pass/fail rates
- Test execution time
- Flaky tests (fail intermittently)

**Example Summary:**
```
Backend Tests:
  Total: 85 tests
  Passed: 83
  Failed: 2
  Duration: 12.5s
  Coverage: 87%

Frontend Tests:
  Total: 62 tests
  Passed: 62
  Failed: 0
  Duration: 8.3s
  Coverage: 78%

E2E Tests:
  Total: 10 tests
  Passed: 10
  Failed: 0
  Duration: 2m 15s
```

### 13.3 Defect Metrics

**Track:**
- Total defects found
- Defects by severity (P0, P1, P2, P3)
- Defects by category (Functional, UI, Performance, Security)
- Open vs. closed defects
- Time to resolution

**Example Defect Summary:**
```
Total Defects Found: 12
  - Critical (P0): 2 (100% resolved)
  - High (P1): 4 (75% resolved)
  - Medium (P2): 5 (60% resolved)
  - Low (P3): 1 (0% resolved)

Defects by Category:
  - Input Validation: 5
  - API Error Handling: 3
  - UI/UX: 3
  - Data Integrity: 1
```

### 13.4 Test Coverage Report Document

**Final Deliverable:** `TEST_COVERAGE_REPORT.md`

**Contents:**
1. Executive Summary
2. Test Execution Summary (pass/fail rates)
3. Code Coverage Analysis (by module)
4. Defect Summary
5. Risk Assessment (remaining risks)
6. Recommendations
7. Appendices (detailed coverage reports, test logs)

---

## Conclusion

This test strategy provides a comprehensive roadmap for testing the Roadie application. By following this strategy:

✅ **Comprehensive Coverage:** Unit, integration, E2E, and manual testing  
✅ **Quality Assurance:** High confidence in application stability  
✅ **Professional Standards:** Industry-standard tools and practices  
✅ **Portfolio Value:** Demonstrates QA expertise to hiring managers  
✅ **Maintainability:** Well-organized, documented test suites  
✅ **CI-Ready:** Prepared for continuous integration implementation  

**Next Steps:**
1. ✅ Review and approve this strategy
2. Begin implementation with backend unit tests
3. Progress through integration and E2E tests
4. Conduct manual testing and security testing
5. Generate final coverage reports
6. Document findings and recommendations

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Status:** Approved for Implementation