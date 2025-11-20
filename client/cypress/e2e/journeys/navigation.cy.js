describe('Navigation Journey', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should navigate through all main pages', () => {
    // Check homepage loads
    cy.contains('Roadie').should('be.visible')
    
    // Navigate to My Schedule
    cy.contains('My Schedule').click()
    cy.url().should('include', '/myEvents')
    
    // Navigate to Festivals
    cy.contains('Festivals').click()
    cy.url().should('include', '/allEvents')
    
    // Navigate to Artists
    cy.contains('Artists').click()
    cy.url().should('include', '/allArtists')
    
    // Navigate to Create Event
    cy.contains('Create Event').click()
    cy.url().should('include', '/createEvent')
    cy.contains('Create an Event').should('be.visible')
    
    // Navigate to Add Artist
    cy.contains('Add Artist').click()
    cy.url().should('include', '/addArtist')
    cy.contains('Add an Artist').should('be.visible')
    
    // Navigate back home via logo/brand
    cy.contains('Roadie').first().click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should have working navbar on all pages', () => {
    const pages = [
      '/myEvents',
      '/allEvents',
      '/allArtists',
      '/createEvent',
      '/addArtist'
    ]
    
    pages.forEach(page => {
      cy.visit(page)
      
      // Navbar should be visible
      cy.contains('Roadie').should('be.visible')
      cy.contains('My Schedule').should('be.visible')
      cy.contains('Festivals').should('be.visible')
      cy.contains('Artists').should('be.visible')
      cy.contains('Create Event').should('be.visible')
      cy.contains('Add Artist').should('be.visible')
    })
  })

  it('should handle browser back button correctly', () => {
    // Navigate through several pages
    cy.contains('Festivals').click()
    cy.url().should('include', '/allEvents')
    
    cy.contains('Artists').click()
    cy.url().should('include', '/allArtists')
    
    // Use browser back button
    cy.go('back')
    cy.url().should('include', '/allEvents')
    
    cy.go('back')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Use browser forward button
    cy.go('forward')
    cy.url().should('include', '/allEvents')
  })

  it('should work on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport('iphone-x')
    
    // Mobile menu toggle should be visible
    cy.get('.navbar-toggler').should('be.visible')
    
    // Click to open mobile menu
    cy.get('.navbar-toggler').click()
    
    // Navigation links should appear
    cy.contains('My Schedule').should('be.visible')
    cy.contains('Festivals').should('be.visible')
    cy.contains('Artists').should('be.visible')
    
    // Click a link
    cy.contains('Festivals').click()
    cy.url().should('include', '/allEvents')
  })
})