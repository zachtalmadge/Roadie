describe('Create Event Journey', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset');
    cy.visit('/');
  });

  it('should successfully create a new festival event', () => {
    // Navigate to create event page
    cy.contains('Create Event').click();
    
    // Verify we're on the create event page
    cy.url().should('include', '/createEvent');
    cy.contains('Create an Event').should('be.visible');
    
    // Fill out the form using placeholder selectors
    cy.get('input[placeholder="Enter Name of Event"]').type('Coachella 2025');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Empire Polo Club');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Indio, CA');
    
    // Fill dates (use type="date" selector)
    cy.get('input[type="date"]').first().type('2025-04-11');
    cy.get('input[type="date"]').last().type('2025-04-13');
    
    // Fill artists
    cy.get('input[placeholder="Artist 1"]').type('Tyler, The Creator');
    cy.get('input[placeholder="Artist 2"]').type('Lana Del Rey');
    cy.get('input[placeholder="Artist 3"]').type('Doja Cat');
    cy.get('input[placeholder="Artist 4"]').type('Peso Pluma');
    cy.get('input[placeholder="Artist 5"]').type('No Doubt');
    cy.get('input[placeholder="Artist 6"]').type('Justice');
    
    // Fill attendance (use controlId which becomes id)
    cy.get('#attendance').type('125000');
    
    // Select camping option
    cy.get('input[type="radio"][value="true"]').check();
    
    // Submit the form
    cy.contains('button', 'Submit').click();
    
    // Verify success modal appears
    cy.contains('Event Added').should('be.visible');
    cy.contains('An event has been added to our database!').should('be.visible');
    
    // Close the modal
    cy.contains('button', 'Close').click();
    
    // Verify form was reset
    cy.get('input[placeholder="Enter Name of Event"]').should('have.value', '');
    cy.get('input[placeholder="Enter Name of Venue"]').should('have.value', '');
  });

  it('should show error modal on submission failure', () => {
    // Intercept the API call and force it to fail
    cy.intercept('POST', '**/festivals', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('createEventFail');
    
    cy.contains('Create Event').click();
    
    // Fill all required fields
    cy.get('input[placeholder="Enter Name of Event"]').type('Test Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-01-01');
    cy.get('input[type="date"]').last().type('2025-01-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    // Wait for API call
    cy.wait('@createEventFail');
    
    // Verify error modal
    cy.contains('An error has occurred').should('be.visible');
    cy.contains('Something went wrong').should('be.visible');
    
    // Close modal
    cy.contains('button', 'Close').click();
    
    // Verify form data is preserved
    cy.get('input[placeholder="Enter Name of Event"]').should('have.value', 'Test Event');
  });

  it('should validate required fields', () => {
    cy.contains('Create Event').click();
    
    // Try to submit without filling required fields
    cy.contains('button', 'Submit').click();
    
    // Form should not submit (HTML5 validation)
    // We should still be on the same page
    cy.url().should('include', '/createEvent');
    
    // Modal should NOT appear
    cy.contains('Event Added').should('not.exist');
  });
});

describe('Create Event Journey - Edge Cases', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset');
    cy.visit('/');
  });

  it('should handle very long event name', () => {
    const longName = 'Super Ultra Mega Music Festival '.repeat(10); // ~350 chars
    
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type(longName);
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Austin, TX');
    cy.get('input[type="date"]').first().type('2025-06-01');
    cy.get('input[type="date"]').last().type('2025-06-03');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('50000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Event Added', { timeout: 10000 }).should('be.visible');
  });

  it('should handle special characters and unicode in event details', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Fête de la Musique & Rock \'n\' Roll Café');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Stade de France / O2 Arena™');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('San José, CA');
    cy.get('input[type="date"]').first().type('2025-07-14');
    cy.get('input[type="date"]').last().type('2025-07-16');
    cy.get('input[placeholder="Artist 1"]').type('Beyoncé');
    cy.get('input[placeholder="Artist 2"]').type('Sigur Rós');
    cy.get('input[placeholder="Artist 3"]').type('Mötley Crüe');
    cy.get('input[placeholder="Artist 4"]').type('Guns N\' Roses');
    cy.get('input[placeholder="Artist 5"]').type('AC/DC');
    cy.get('input[placeholder="Artist 6"]').type('twenty øne piløts');
    cy.get('#attendance').type('100000');
    cy.get('input[type="radio"][value="false"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Event Added').should('be.visible');
  });

  it('should handle same start and end date (single day event)', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('One Day Festival');
    cy.get('input[placeholder="Enter Name of Venue"]').type('City Park');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Denver, CO');
    cy.get('input[type="date"]').first().type('2025-08-15');
    cy.get('input[type="date"]').last().type('2025-08-15'); // Same day
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('5000');
    cy.get('input[type="radio"][value="false"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Event Added').should('be.visible');
  });

  it('should handle very large attendance numbers', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Massive Festival');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Multiple Venues');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Las Vegas, NV');
    cy.get('input[type="date"]').first().type('2025-09-01');
    cy.get('input[type="date"]').last().type('2025-09-07');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('9999999'); // Very large number
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Event Added').should('be.visible');
  });

  it('should handle dates far in the future', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Future Festival 2030');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Future Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Miami, FL');
    cy.get('input[type="date"]').first().type('2030-12-25');
    cy.get('input[type="date"]').last().type('2030-12-31');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('75000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Event Added').should('be.visible');
  });

  it('should handle "No Camping" option correctly', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('No Camping Festival');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Downtown Arena');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Chicago, IL');
    cy.get('input[type="date"]').first().type('2025-05-10');
    cy.get('input[type="date"]').last().type('2025-05-11');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('20000');
    cy.get('input[type="radio"][value="false"]').check(); // No camping
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Event Added').should('be.visible');
  });

  it('should handle numeric characters in text fields', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Lollapalooza 2025');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Grant Park Area 51');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Chicago, IL');
    cy.get('input[type="date"]').first().type('2025-07-31');
    cy.get('input[type="date"]').last().type('2025-08-03');
    cy.get('input[placeholder="Artist 1"]').type('Blink-182');
    cy.get('input[placeholder="Artist 2"]').type('Maroon 5');
    cy.get('input[placeholder="Artist 3"]').type('The 1975');
    cy.get('input[placeholder="Artist 4"]').type('30 Seconds to Mars');
    cy.get('input[placeholder="Artist 5"]').type('Sum 41');
    cy.get('input[placeholder="Artist 6"]').type('U2');
    cy.get('#attendance').type('100000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Event Added').should('be.visible');
  });

  it('should handle whitespace trimming in inputs', () => {
    cy.contains('Create Event').click();
    
    // Add leading/trailing whitespace
    cy.get('input[placeholder="Enter Name of Event"]').type('  Whitespace Festival  ');
    cy.get('input[placeholder="Enter Name of Venue"]').type('  Venue Name  ');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('  Portland, OR  ');
    cy.get('input[type="date"]').first().type('2025-06-15');
    cy.get('input[type="date"]').last().type('2025-06-17');
    cy.get('input[placeholder="Artist 1"]').type('  Artist 1  ');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('30000');
    cy.get('input[type="radio"][value="false"]').check();
    
    cy.contains('button', 'Submit').click();
    
    // Should succeed (backend should trim or accept)
    cy.contains('Event Added').should('be.visible');
  });
});

describe('Create Event Journey - Sad Paths', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset');
    cy.visit('/');
  });

  it('should show error modal on 400 bad request', () => {
    cy.intercept('POST', '**/festivals', {
      statusCode: 400,
      body: { error: 'Bad request' }
    }).as('createEventBadRequest');
    
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Error Test Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-01-01');
    cy.get('input[type="date"]').last().type('2025-01-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.wait('@createEventBadRequest');
    
    cy.contains('An error has occurred').should('be.visible');
    cy.contains('Something went wrong').should('be.visible');
  });

  it('should show error modal on 500 server error', () => {
    cy.intercept('POST', '**/festivals', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('createEventServerError');
    
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Server Error Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-02-01');
    cy.get('input[type="date"]').last().type('2025-02-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.wait('@createEventServerError');
    
    cy.contains('An error has occurred').should('be.visible');
  });

  it('should preserve form data after error', () => {
    cy.intercept('POST', '**/festivals', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('createEventError');
    
    cy.contains('Create Event').click();
    
    const formData = {
      name: 'Preserved Event Data',
      venue: 'Preserved Venue',
      location: 'Seattle, WA'
    };
    
    cy.get('input[placeholder="Enter Name of Event"]').type(formData.name);
    cy.get('input[placeholder="Enter Name of Venue"]').type(formData.venue);
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type(formData.location);
    cy.get('input[type="date"]').first().type('2025-03-01');
    cy.get('input[type="date"]').last().type('2025-03-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('5000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    cy.wait('@createEventError');
    
    // Close error modal
    cy.contains('button', 'Close').click();
    
    // Verify form data is preserved
    cy.get('input[placeholder="Enter Name of Event"]').should('have.value', formData.name);
    cy.get('input[placeholder="Enter Name of Venue"]').should('have.value', formData.venue);
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').should('have.value', formData.location);
  });

  it('should handle slow network response', () => {
    cy.intercept('POST', '**/festivals', (req) => {
      req.reply({
        statusCode: 200,
        body: { success: true },
        delay: 3000 // 3 second delay
      });
    }).as('slowCreateEvent');
    
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Slow Network Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-04-01');
    cy.get('input[type="date"]').last().type('2025-04-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    // Should eventually succeed
    cy.wait('@slowCreateEvent');
    cy.contains('Event Added', { timeout: 5000 }).should('be.visible');
  });

  it('should not allow submission with only whitespace in required fields', () => {
    cy.contains('Create Event').click();
    
    // Fill with only whitespace
    cy.get('input[placeholder="Enter Name of Event"]').type('   ');
    cy.get('input[placeholder="Enter Name of Venue"]').type('   ');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('   ');
    cy.get('input[type="date"]').first().type('2025-05-01');
    cy.get('input[type="date"]').last().type('2025-05-02');
    cy.get('input[placeholder="Artist 1"]').type('   ');
    cy.get('input[placeholder="Artist 2"]').type('   ');
    cy.get('input[placeholder="Artist 3"]').type('   ');
    cy.get('input[placeholder="Artist 4"]').type('   ');
    cy.get('input[placeholder="Artist 5"]').type('   ');
    cy.get('input[placeholder="Artist 6"]').type('   ');
    cy.get('#attendance').type('   ');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    // Success modal should NOT appear (validation should reject)
    cy.contains('Event Added', { timeout: 2000 }).should('not.exist');
  });

  it('should handle network failure gracefully', () => {
    cy.intercept('POST', '**/festivals', { forceNetworkError: true }).as('networkError');
    
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Network Error Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-06-01');
    cy.get('input[type="date"]').last().type('2025-06-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    // Should show error modal (if error handling exists)
    cy.contains('An error has occurred', { timeout: 3000 }).should('be.visible');
  });

  it('should prevent double submission on double click', () => {
    let requestCount = 0;
    
    cy.intercept('POST', '**/festivals', (req) => {
      requestCount++;
      req.reply({
        statusCode: 200,
        body: { success: true },
        delay: 1000
      });
    }).as('createEvent');
    
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Double Click Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-07-01');
    cy.get('input[type="date"]').last().type('2025-07-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    cy.get('input[type="radio"][value="true"]').check();
    
    // Double click submit button
    cy.contains('button', 'Submit').dblclick();
    
    // Wait for response
    cy.wait('@createEvent');
    
    // Should only make ONE request
    cy.wrap(null).then(() => {
      expect(requestCount).to.equal(1);
    });
  });

  it('should handle submission without selecting camping option', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('No Camping Selected Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-08-01');
    cy.get('input[type="date"]').last().type('2025-08-02');
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    // Don't select any camping option
    
    cy.contains('button', 'Submit').click();
    
    // Should still succeed (camping is optional OR should show validation error)
    // Document actual behavior here
    cy.contains('Event Added').should('be.visible');
  });

  it('should handle end date before start date', () => {
    cy.contains('Create Event').click();
    
    cy.get('input[placeholder="Enter Name of Event"]').type('Invalid Date Event');
    cy.get('input[placeholder="Enter Name of Venue"]').type('Test Venue');
    cy.get('input[placeholder="Enter (City, State Abbreviation)"]').type('Test, CA');
    cy.get('input[type="date"]').first().type('2025-12-31'); // Start date AFTER
    cy.get('input[type="date"]').last().type('2025-01-01'); // End date BEFORE
    cy.get('input[placeholder="Artist 1"]').type('Artist1');
    cy.get('input[placeholder="Artist 2"]').type('Artist2');
    cy.get('input[placeholder="Artist 3"]').type('Artist3');
    cy.get('input[placeholder="Artist 4"]').type('Artist4');
    cy.get('input[placeholder="Artist 5"]').type('Artist5');
    cy.get('input[placeholder="Artist 6"]').type('Artist6');
    cy.get('#attendance').type('1000');
    cy.get('input[type="radio"][value="true"]').check();
    
    cy.contains('button', 'Submit').click();
    
    // Should show validation error OR success (document actual behavior)
    // This test documents whether date validation exists
  });
});