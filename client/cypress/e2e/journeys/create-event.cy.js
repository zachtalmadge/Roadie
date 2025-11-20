describe('Create Event Journey', () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('/')
  })

  it('should successfully create a new festival event', () => {
    // Navigate to create event page
    cy.contains('Create Event').click()
    
    // Verify we're on the create event page
    cy.url().should('include', '/createEvent')
    cy.contains('Create an Event').should('be.visible')
    
    // Fill out the form
    cy.get('input[name="name"]').type('Coachella 2025')
    cy.get('input[name="venue"]').type('Empire Polo Club')
    cy.get('input[name="location"]').type('Indio, CA')
    
    // Fill dates
    cy.get('input[type="date"]').first().type('2025-04-11')
    cy.get('input[type="date"]').last().type('2025-04-13')
    
    // Fill artists
    cy.get('input[placeholder*="Artist 1"]').type('Tyler, The Creator')
    cy.get('input[placeholder*="Artist 2"]').type('Lana Del Rey')
    cy.get('input[placeholder*="Artist 3"]').type('Doja Cat')
    cy.get('input[placeholder*="Artist 4"]').type('Peso Pluma')
    cy.get('input[placeholder*="Artist 5"]').type('No Doubt')
    cy.get('input[placeholder*="Artist 6"]').type('Justice')
    
    // Fill attendance
    cy.get('input[name="attendance"]').type('125000')
    
    // Select camping option
    cy.get('input[type="radio"][value="true"]').check()
    
    // Submit the form
    cy.contains('button', 'Submit').click()
    
    // Verify success modal appears
    cy.contains('Event Added').should('be.visible')
    cy.contains('An event has been added to our database!').should('be.visible')
    
    // Close the modal
    cy.contains('button', 'Close').click()
    
    // Verify form was reset
    cy.get('input[name="name"]').should('have.value', '')
    cy.get('input[name="venue"]').should('have.value', '')
  })

  it('should show error modal on submission failure', () => {
    // Intercept the API call and force it to fail
    cy.intercept('POST', '**/festivals', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('createEventFail')
    
    cy.contains('Create Event').click()
    
    // Fill minimum required fields
    cy.get('input[name="name"]').type('Test Event')
    cy.get('input[name="venue"]').type('Test Venue')
    cy.get('input[name="location"]').type('Test, CA')
    cy.get('input[type="date"]').first().type('2025-01-01')
    cy.get('input[type="date"]').last().type('2025-01-02')
    cy.get('input[placeholder*="Artist 1"]').type('Artist1')
    cy.get('input[placeholder*="Artist 2"]').type('Artist2')
    cy.get('input[placeholder*="Artist 3"]').type('Artist3')
    cy.get('input[placeholder*="Artist 4"]').type('Artist4')
    cy.get('input[placeholder*="Artist 5"]').type('Artist5')
    cy.get('input[placeholder*="Artist 6"]').type('Artist6')
    cy.get('input[name="attendance"]').type('1000')
    cy.get('input[type="radio"][value="true"]').check()
    
    cy.contains('button', 'Submit').click()
    
    // Wait for API call
    cy.wait('@createEventFail')
    
    // Verify error modal
    cy.contains('An error has occurred').should('be.visible')
    cy.contains('Something went wrong').should('be.visible')
    
    // Close modal
    cy.contains('button', 'Close').click()
    
    // Verify form data is preserved
    cy.get('input[name="name"]').should('have.value', 'Test Event')
  })

  it('should validate required fields', () => {
    cy.contains('Create Event').click()
    
    // Try to submit without filling required fields
    cy.contains('button', 'Submit').click()
    
    // Form should not submit (HTML5 validation)
    // We should still be on the same page
    cy.url().should('include', '/createEvent')
    
    // Modal should NOT appear
    cy.contains('Event Added').should('not.exist')
  })
})