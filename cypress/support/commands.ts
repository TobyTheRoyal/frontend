Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((resp) => {
    const token = resp.body.access_token;
    if (token) {
      cy.window().then((win) => win.localStorage.setItem('auth_token', token));
    }
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => win.localStorage.removeItem('auth_token'));
});

// Optionally add more commands here

// TypeScript definition for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /** Log a user in by posting credentials to the API */
      login(email: string, password: string): Chainable<void>;
      /** Remove the auth token from local storage */
      logout(): Chainable<void>;
    }
  }
}

export {}