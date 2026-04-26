import './commands';

// Silence uncaught exceptions from the app that don't affect the test
Cypress.on('uncaught:exception', () => false);
