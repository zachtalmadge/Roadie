describe('Create Artist Journey', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should successfully create a new artist', () => {
    // Navigate to add artist page
    cy.contains('Add Artist').click()

    // Verify we're on the correct page
    cy.url().should('include', '/addArtist')
    cy.contains('Add an Artist').should('be.visible')

    // Fill out the form
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Daft Punk')
    cy.get('input[placeholder*="Enter Genre"]').type('Electronic')
    cy.get('input[placeholder*="Enter Music Label"]').type('Columbia Records')

    // Fill albums
    cy.get('input[placeholder*="Enter Album 1"]').type('Discovery')
    cy.get('input[placeholder*="Enter Album 2"]').type('Random Access Memories')
    cy.get('input[placeholder*="Enter Album 3"]').type('Homework')

    // Fill singles
    cy.get('input[placeholder*="Enter Single 1"]').type('Get Lucky')
    cy.get('input[placeholder*="Enter Single 2"]').type('One More Time')
    cy.get('input[placeholder*="Enter Single 3"]').type('Harder Better Faster Stronger')

    // Fill bio
    cy.get('textarea[placeholder*="Enter a short bio"]').type('French electronic music duo formed in 1993.')

    // Submit the form
    cy.contains('button', 'Submit').click()

    // Verify success modal
    cy.contains('Artist Added!').should('be.visible')
    cy.contains('You have successfully added an artist').should('be.visible')

    // Close modal
    cy.contains('button', 'Close').click()

    // Verify form was reset
    cy.get('input[placeholder*="Enter Name of Artist"]').should('have.value', '')
  })

  it('should handle special characters in artist data', () => {
    cy.contains('Add Artist').click()

    // Test special characters
    cy.get('input[placeholder*="Enter Name of Artist"]').type("Guns N' Roses")
    cy.get('input[placeholder*="Enter Genre"]').type('Hard Rock & Metal')
    cy.get('input[placeholder*="Enter Music Label"]').type('Geffen Records')
    cy.get('input[placeholder*="Enter Album 1"]').type('Appetite for Destruction')
    cy.get('input[placeholder*="Enter Album 2"]').type('Use Your Illusion I')
    cy.get('input[placeholder*="Enter Album 3"]').type('Use Your Illusion II')
    cy.get('input[placeholder*="Enter Single 1"]').type("Sweet Child O' Mine")
    cy.get('input[placeholder*="Enter Single 2"]').type('November Rain')
    cy.get('input[placeholder*="Enter Single 3"]').type('Paradise City')

    cy.contains('button', 'Submit').click()

    // Should still succeed
    cy.contains('Artist Added!').should('be.visible')
  })

  it('should allow submission with empty bio field (optional)', () => {
    cy.contains('Add Artist').click()

    // Fill all required fields, leave bio empty (only optional field)
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Test Artist')
    cy.get('input[placeholder*="Enter Genre"]').type('Rock')
    cy.get('input[placeholder*="Enter Music Label"]').type('Test Label')
    cy.get('input[placeholder*="Enter Album 1"]').type('Album 1')
    cy.get('input[placeholder*="Enter Album 2"]').type('Album 2')
    cy.get('input[placeholder*="Enter Album 3"]').type('Album 3')
    cy.get('input[placeholder*="Enter Single 1"]').type('Single 1')
    cy.get('input[placeholder*="Enter Single 2"]').type('Single 2')
    cy.get('input[placeholder*="Enter Single 3"]').type('Single 3')
    // Leave bio empty - it's the only optional field

    cy.contains('button', 'Submit').click()

    // Should succeed
    cy.contains('Artist Added!').should('be.visible')
  })
})
describe('Create Artist Journey - Edge Cases', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset');
    cy.visit('/');
  });

  it('should handle very long artist name', () => {
    const longName = 'A'.repeat(200); // 200 character name
    
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type(longName);
    cy.get('input[placeholder*="Enter Genre"]').type('Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Label');
    cy.get('input[placeholder*="Enter Album 1"]').type('Album1');
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    
    cy.contains('button', 'Submit').click();
    
    // Should handle long names gracefully
    cy.contains('Artist Added!', { timeout: 10000 }).should('be.visible');
  });

  it('should handle very long bio text', () => {
    const longBio = 'This is a very long biography. '.repeat(100); // ~3000 characters
    
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Bio Test Artist');
    cy.get('input[placeholder*="Enter Genre"]').type('Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Label');
    cy.get('input[placeholder*="Enter Album 1"]').type('Album1');
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    
    // Use invoke to set value directly (faster than typing)
    cy.get('textarea[placeholder*="Enter a short bio"]').invoke('val', longBio);
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Artist Added!').should('be.visible');
  });

  it('should handle special characters and unicode', () => {
    cy.contains('Add Artist').click();
    
    // Test various special characters
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Björk & Sigur Rós');
    cy.get('input[placeholder*="Enter Genre"]').type('Post-Rock/Avant-Garde');
    cy.get('input[placeholder*="Enter Music Label"]').type('One Little Indian Records');
    cy.get('input[placeholder*="Enter Album 1"]').type('Homogenic');
    cy.get('input[placeholder*="Enter Album 2"]').type('Vespertine');
    cy.get('input[placeholder*="Enter Album 3"]').type('Medúlla');
    cy.get('input[placeholder*="Enter Single 1"]').type('Jóga');
    cy.get('input[placeholder*="Enter Single 2"]').type('Hyperballad');
    cy.get('input[placeholder*="Enter Single 3"]').type('It\'s Oh So Quiet');
    cy.get('textarea[placeholder*="Enter a short bio"]').type('Icelandic singer with émojis 🎵🎶');
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Artist Added!').should('be.visible');
  });

  it('should handle numbers in text fields', () => {
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Blink-182');
    cy.get('input[placeholder*="Enter Genre"]').type('Pop Punk');
    cy.get('input[placeholder*="Enter Music Label"]').type('DGC Records');
    cy.get('input[placeholder*="Enter Album 1"]').type('Enema of the State');
    cy.get('input[placeholder*="Enter Album 2"]').type('Take Off Your Pants and Jacket');
    cy.get('input[placeholder*="Enter Album 3"]').type('Blink-182 (2003)');
    cy.get('input[placeholder*="Enter Single 1"]').type('All the Small Things');
    cy.get('input[placeholder*="Enter Single 2"]').type('What\'s My Age Again?');
    cy.get('input[placeholder*="Enter Single 3"]').type('I Miss You');
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Artist Added!').should('be.visible');
  });

  it('should trim whitespace from inputs', () => {
    cy.contains('Add Artist').click();
    
    // Add leading/trailing whitespace
    cy.get('input[placeholder*="Enter Name of Artist"]').type('  Whitespace Artist  ');
    cy.get('input[placeholder*="Enter Genre"]').type('  Rock  ');
    cy.get('input[placeholder*="Enter Music Label"]').type('  Label  ');
    cy.get('input[placeholder*="Enter Album 1"]').type('  Album1  ');
    cy.get('input[placeholder*="Enter Album 2"]').type('  Album2  ');
    cy.get('input[placeholder*="Enter Album 3"]').type('  Album3  ');
    cy.get('input[placeholder*="Enter Single 1"]').type('  Single1  ');
    cy.get('input[placeholder*="Enter Single 2"]').type('  Single2  ');
    cy.get('input[placeholder*="Enter Single 3"]').type('  Single3  ');
    
    cy.contains('button', 'Submit').click();
    
    // Should succeed (backend should trim or accept)
    cy.contains('Artist Added!').should('be.visible');
  });

  it('should handle apostrophes and quotes correctly', () => {
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Guns N\' Roses');
    cy.get('input[placeholder*="Enter Genre"]').type('Hard Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Geffen');
    cy.get('input[placeholder*="Enter Album 1"]').type('Appetite for Destruction');
    cy.get('input[placeholder*="Enter Album 2"]').type('Use Your Illusion');
    cy.get('input[placeholder*="Enter Album 3"]').type('"The Spaghetti Incident?"');
    cy.get('input[placeholder*="Enter Single 1"]').type('Sweet Child O\' Mine');
    cy.get('input[placeholder*="Enter Single 2"]').type('Don\'t Cry');
    cy.get('input[placeholder*="Enter Single 3"]').type('November Rain');
    
    cy.contains('button', 'Submit').click();
    
    cy.contains('Artist Added!').should('be.visible');
  });
});

describe('Create Artist Journey - Sad Paths', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset');
    cy.visit('/');
  });

  it('should show error modal on 400 bad request', () => {
    // Intercept and force 400 error
    cy.intercept('POST', '**/artists', {
      statusCode: 400,
      body: { error: 'Bad request' }
    }).as('createArtistBadRequest');
    
    cy.contains('Add Artist').click();
    
    // Fill valid form
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Error Test Artist');
    cy.get('input[placeholder*="Enter Genre"]').type('Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Label');
    cy.get('input[placeholder*="Enter Album 1"]').type('Album1');
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    
    cy.contains('button', 'Submit').click();
    
    cy.wait('@createArtistBadRequest');
    
    // Should show error modal
    cy.contains('An error has occured').should('be.visible');
    cy.contains('Something went wrong').should('be.visible');
  });

  it('should show error modal on 500 server error', () => {
    cy.intercept('POST', '**/artists', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('createArtistServerError');
    
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Server Error Artist');
    cy.get('input[placeholder*="Enter Genre"]').type('Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Label');
    cy.get('input[placeholder*="Enter Album 1"]').type('Album1');
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    
    cy.contains('button', 'Submit').click();
    
    cy.wait('@createArtistServerError');
    
    cy.contains('An error has occured').should('be.visible');
  });

  it('should preserve form data after error', () => {
    cy.intercept('POST', '**/artists', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('createArtistError');
    
    cy.contains('Add Artist').click();
    
    const formData = {
      name: 'Preserved Data Artist',
      genre: 'Jazz',
      label: 'Blue Note Records',
      album1: 'Kind of Blue',
      bio: 'Test bio that should be preserved'
    };
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type(formData.name);
    cy.get('input[placeholder*="Enter Genre"]').type(formData.genre);
    cy.get('input[placeholder*="Enter Music Label"]').type(formData.label);
    cy.get('input[placeholder*="Enter Album 1"]').type(formData.album1);
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    cy.get('textarea[placeholder*="Enter a short bio"]').type(formData.bio);
    
    cy.contains('button', 'Submit').click();
    
    cy.wait('@createArtistError');
    
    // Close error modal
    cy.contains('button', 'Close').click();
    
    // Verify form data is preserved
    cy.get('input[placeholder*="Enter Name of Artist"]').should('have.value', formData.name);
    cy.get('input[placeholder*="Enter Genre"]').should('have.value', formData.genre);
    cy.get('input[placeholder*="Enter Music Label"]').should('have.value', formData.label);
    cy.get('input[placeholder*="Enter Album 1"]').should('have.value', formData.album1);
    cy.get('textarea[placeholder*="Enter a short bio"]').should('have.value', formData.bio);
  });

  it('should handle slow network response', () => {
    // Simulate slow network
    cy.intercept('POST', '**/artists', (req) => {
      req.reply({
        statusCode: 200,
        body: { success: true },
        delay: 3000 // 3 second delay
      });
    }).as('slowCreateArtist');
    
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Slow Network Artist');
    cy.get('input[placeholder*="Enter Genre"]').type('Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Label');
    cy.get('input[placeholder*="Enter Album 1"]').type('Album1');
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    
    cy.contains('button', 'Submit').click();
    
    // Should eventually succeed
    cy.wait('@slowCreateArtist');
    cy.contains('Artist Added!', { timeout: 5000 }).should('be.visible');
  });

  it('should not allow submission with only whitespace in required fields', () => {
    cy.contains('Add Artist').click();
    
    // Try to submit with only spaces
    cy.get('input[placeholder*="Enter Name of Artist"]').type('   ');
    cy.get('input[placeholder*="Enter Genre"]').type('   ');
    cy.get('input[placeholder*="Enter Music Label"]').type('   ');
    cy.get('input[placeholder*="Enter Album 1"]').type('   ');
    cy.get('input[placeholder*="Enter Album 2"]').type('   ');
    cy.get('input[placeholder*="Enter Album 3"]').type('   ');
    cy.get('input[placeholder*="Enter Single 1"]').type('   ');
    cy.get('input[placeholder*="Enter Single 2"]').type('   ');
    cy.get('input[placeholder*="Enter Single 3"]').type('   ');
    
    cy.contains('button', 'Submit').click();
    
    // HTML5 validation should prevent submission OR backend should reject
    // Either way, success modal should NOT appear
    cy.contains('Artist Added!', { timeout: 2000 }).should('not.exist');
  });

  it('should handle network failure gracefully', () => {
    // Force network error
    cy.intercept('POST', '**/artists', { forceNetworkError: true }).as('networkError');
    
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Network Error Artist');
    cy.get('input[placeholder*="Enter Genre"]').type('Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Label');
    cy.get('input[placeholder*="Enter Album 1"]').type('Album1');
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    
    cy.contains('button', 'Submit').click();
    
    // Should show error modal (if error handling exists)
    // This might fail if network errors aren't caught - that's a bug to document
    cy.contains('An error has occured', { timeout: 3000 }).should('be.visible');
  });

  it('should prevent double submission on double click', () => {
    let requestCount = 0;
    
    cy.intercept('POST', '**/artists', (req) => {
      requestCount++;
      req.reply({
        statusCode: 200,
        body: { success: true },
        delay: 1000 // Simulate slow response
      });
    }).as('createArtist');
    
    cy.contains('Add Artist').click();
    
    cy.get('input[placeholder*="Enter Name of Artist"]').type('Double Click Artist');
    cy.get('input[placeholder*="Enter Genre"]').type('Rock');
    cy.get('input[placeholder*="Enter Music Label"]').type('Label');
    cy.get('input[placeholder*="Enter Album 1"]').type('Album1');
    cy.get('input[placeholder*="Enter Album 2"]').type('Album2');
    cy.get('input[placeholder*="Enter Album 3"]').type('Album3');
    cy.get('input[placeholder*="Enter Single 1"]').type('Single1');
    cy.get('input[placeholder*="Enter Single 2"]').type('Single2');
    cy.get('input[placeholder*="Enter Single 3"]').type('Single3');
    
    // Double click submit button
    cy.contains('button', 'Submit').dblclick();
    
    // Wait for response
    cy.wait('@createArtist');
    
    // Should only make ONE request (button should be disabled during submission)
    cy.wrap(null).then(() => {
      expect(requestCount).to.equal(1);
    });
  });
});