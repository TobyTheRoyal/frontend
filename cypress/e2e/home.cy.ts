describe('Home Page', () => {
  it('should load and show hero section', () => {
    cy.visit('http://localhost:4200');
    cy.contains('Trending Now').should('exist');
  });
});
