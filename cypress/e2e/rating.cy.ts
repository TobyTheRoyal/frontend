describe('Ratings – Bewerten, Anzeigen & Aktualisieren über /history', () => {
  const email = 'tobias1.hamedl@gmail.com';
  const password = 'test';
  const initialRating = '9.0';
  const updatedRating = '8.3';

  before(() => {
    cy.login(email, password);
    cy.visit('/');
  });

  it('should rate a movie from the home page and show badge', () => {
    cy.get('#trending .content-card').first().within(() => {
      cy.get('.rating-btn').click();
    });

    cy.get('.rating-input-field')
      .should('have.length', 1)
      .clear()
      .type(initialRating);

    cy.get('.submit-rating-btn').click();

    cy.contains('Your rating has been submitted').should('exist');

    // Badge prüfen
    cy.get('#trending .content-card').first().within(() => {
      cy.get('.rating-badge').should('contain', initialRating);
    });
  });

  it('should show the rated item in /history and allow updating it', () => {
    cy.visit('/history');

    cy.get('.content-card').should('have.length.greaterThan', 0);

    // Rating erneut öffnen
    cy.get('.content-card').first().within(() => {
      cy.get('.rating-btn').click();
    });

    // Sicherstellen, dass nur ein Eingabefeld aktiv ist
    cy.get('.rating-input-field')
      .should('have.length', 1)
      .clear()
      .type(updatedRating);

    cy.get('.submit-rating-btn').click();

    cy.contains('Your rating has been submitted').should('exist');

    // Badge prüfen nach Update
    cy.get('.content-card').first().within(() => {
      cy.get('.rating-badge').should('contain', updatedRating);
    });
  });
});
