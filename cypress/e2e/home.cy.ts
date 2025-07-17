describe('Home Page', () => {
  it('displays hero text', () => {
    cy.visit('/');
    cy.contains('h1', 'Your personal streaming companion').should('be.visible');
  });
});