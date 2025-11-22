describe('User Journey - Add Festival to Schedule', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset-and-seed');
    cy.visit('/');
  });

  it('should add Electric Forest from All Festivals page and see it in My Schedule', () => {
    // Navigate to All Festivals
    cy.contains('Festivals').click();
    cy.url().should('include', '/allEvents');
    
    // Find Electric Forest card by title and click Add to Schedule
    cy.contains('.card-title', 'Electric Forest')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    // Verify success modal appears and close it
    cy.get('.modal').should('be.visible');
    cy.contains('Electric Forest has been added to your schedule').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click();
    cy.url().should('include', '/myEvents');
    
    // Verify Electric Forest is in My Schedule
    cy.contains('.card-title', 'Electric Forest').should('be.visible');
  });

  it('should add Coachella from Festival Details page and see it in My Schedule', () => {
    // Navigate to All Festivals
    cy.contains('Festivals').click();
    
    // Click on Coachella to view details
    cy.contains('.card-title', 'Coachella')
      .parents('.card')
      .first()
      .contains('View Details')
      .click();
    
    // Verify we're on the details page
    cy.contains('Coachella').should('be.visible');
    cy.contains('Empire Polo Club').should('be.visible');
    
    // Click "Add to Schedule" on details page
    cy.contains('button', /add to schedule/i).click();
    
    // Close modal
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click();
    
    // Verify Coachella is in My Schedule
    cy.contains('.card-title', 'Coachella').should('be.visible');
  });

  it('should disable Add button after Lollapalooza is added from card', () => {
    // Navigate to All Festivals
    cy.contains('Festivals').click();
    
    // Add Lollapalooza to schedule
    cy.contains('.card-title', 'Lollapalooza')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    // Close modal
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Verify button is now disabled
    cy.contains('.card-title', 'Lollapalooza')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .should('be.disabled');
  });

  it('should disable Add button on Ultra details page after adding', () => {
    // Navigate to All Festivals
    cy.contains('Festivals').click();
    
    // Click on Ultra to view details
    cy.contains('.card-title', 'Ultra Music Festival')
      .parents('.card')
      .first()
      .contains('View Details')
      .click();
    
    // Click "Add to Schedule"
    cy.contains('button', /add to schedule/i).click();
    
    // Close modal
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Button should now be disabled
    cy.contains('button', /add to schedule/i).should('be.disabled');
  });
});

describe('User Journey - Remove Festival from Schedule', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset-and-seed');
    cy.visit('/');
  });

  it('should remove Lost Lands from My Schedule', () => {
    // First, add Lost Lands to schedule
    cy.contains('Festivals').click();
    cy.contains('.card-title', 'Lost Lands')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    // Close success modal
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click();
    cy.url().should('include', '/myEvents');
    
    // Verify Lost Lands is in schedule
    cy.contains('.card-title', 'Lost Lands').should('be.visible');
    
    // Click Remove button (opens confirmation modal)
    cy.contains('.card-title', 'Lost Lands')
      .parents('.card')
      .first()
      .contains('button', 'Remove')
      .click();
    
    // Confirmation modal - click Confirm to delete
    cy.get('.modal').find('button').contains('Confirm').click();
    
    // Verify Lost Lands is no longer in My Schedule
    cy.contains('.card-title', 'Lost Lands').should('not.exist');
  });

  it('should keep Electric Forest when clicking Cancel in confirmation modal', () => {
    // First, add Electric Forest to schedule
    cy.contains('Festivals').click();
    cy.contains('.card-title', 'Electric Forest')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    // Close success modal
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click();
    
    // Verify festival is there
    cy.contains('.card-title', 'Electric Forest').should('be.visible');
    
    // Click Remove button (opens confirmation modal)
    cy.contains('.card-title', 'Electric Forest')
      .parents('.card')
      .first()
      .contains('button', 'Remove')
      .click();
    
    // Click Cancel button to dismiss modal
    cy.get('.modal').find('button').contains('Cancel').click();
    
    // Verify festival is STILL in schedule (not removed)
    cy.contains('.card-title', 'Electric Forest').should('be.visible');
  });
});

describe('User Journey - Full End-to-End Flow', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset-and-seed');
    cy.visit('/');
  });

  it('should add Coachella and Lollapalooza, then remove Coachella', () => {
    // Navigate to All Festivals
    cy.contains('Festivals').click();
    cy.url().should('include', '/allEvents');
    
    // Add Coachella to schedule
    cy.contains('.card-title', 'Coachella')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Add Lollapalooza to schedule
    cy.contains('.card-title', 'Lollapalooza')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click();
    
    // Verify both festivals are in schedule
    cy.contains('.card-title', 'Coachella').should('be.visible');
    cy.contains('.card-title', 'Lollapalooza').should('be.visible');
    
    // Remove Coachella
    cy.contains('.card-title', 'Coachella')
      .parents('.card')
      .first()
      .contains('button', 'Remove')
      .click();
    
    // Confirm deletion
    cy.get('.modal').find('button').contains('Confirm').click();
    
    // Verify Coachella is removed but Lollapalooza remains
    cy.contains('.card-title', 'Coachella').should('not.exist');
    cy.contains('.card-title', 'Lollapalooza').should('be.visible');
  });

  it('should persist Ultra Music Festival after page refresh', () => {
    // Add Ultra Music Festival
    cy.contains('Festivals').click();
    cy.contains('.card-title', 'Ultra Music Festival')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click();
    cy.contains('.card-title', 'Ultra Music Festival').should('be.visible');
    
    // Refresh the page
    cy.reload();
    
    // Verify festival is still there
    cy.contains('.card-title', 'Ultra Music Festival').should('be.visible');
  });

  it('should navigate from My Schedule to Lost Lands details', () => {
    // Add Lost Lands first
    cy.contains('Festivals').click();
    cy.contains('.card-title', 'Lost Lands')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Go to My Schedule
    cy.contains('My Schedule').click();
    
    // Click View Details on Lost Lands card
    cy.contains('.card-title', 'Lost Lands')
      .parents('.card')
      .first()
      .contains('View Details')
      .click();
    
    // Verify details page shows correct info
    cy.contains('Lost Lands').should('be.visible');
    cy.contains('Legend Valley').should('be.visible');
    cy.contains('Excision').should('be.visible');
  });
});

describe('User Journey - Edge Cases', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset-and-seed');
    cy.visit('/');
  });

  it('should add all 5 available festivals to schedule', () => {
    cy.contains('Festivals').click();
    
    const festivals = [
      'Electric Forest',
      'Coachella', 
      'Lollapalooza', 
      'Ultra Music Festival', 
      'Lost Lands'
    ];
    
    // Add each festival
    festivals.forEach(festival => {
      cy.contains('.card-title', festival)
        .parents('.card')
        .first()
        .find('button[data-festival]')
        .click();
      
      cy.get('.modal').should('be.visible');
      cy.get('.modal').find('button').contains('Close').click();
    });
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click();
    
    // Verify all 5 festivals are in schedule
    festivals.forEach(festival => {
      cy.contains('.card-title', festival).should('be.visible');
    });
  });

  it('should show empty My Schedule when no festivals added', () => {
    // Go directly to My Schedule without adding anything
    cy.contains('My Schedule').click();
    cy.url().should('include', '/myEvents');
    
    // Verify no seeded festivals are present
    cy.contains('.card-title', 'Electric Forest').should('not.exist');
    cy.contains('.card-title', 'Coachella').should('not.exist');
  });

  it('should re-enable Add button for Electric Forest after removing from schedule', () => {
    // Add Electric Forest
    cy.contains('Festivals').click();
    cy.contains('.card-title', 'Electric Forest')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .click();
    
    cy.get('.modal').should('be.visible');
    cy.get('.modal').find('button').contains('Close').click();
    
    // Verify button is disabled
    cy.contains('.card-title', 'Electric Forest')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .should('be.disabled');
    
    // Go to My Schedule and remove it
    cy.contains('My Schedule').click();
    cy.contains('.card-title', 'Electric Forest')
      .parents('.card')
      .first()
      .contains('button', 'Remove')
      .click();
    
    // Confirm deletion
    cy.get('.modal').find('button').contains('Confirm').click();
    
    // Go back to All Festivals
    cy.contains('Festivals').click();
    
    // Verify Add button is enabled again for Electric Forest
    cy.contains('.card-title', 'Electric Forest')
      .parents('.card')
      .first()
      .find('button[data-festival]')
      .should('not.be.disabled');
  });
});