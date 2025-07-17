import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    env: {
      apiUrl: 'http://localhost:3000'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
