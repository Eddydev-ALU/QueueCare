// Login Flow — valid credentials, invalid credentials, empty form submission

const ts = () => Date.now();

describe('Login — valid credentials', () => {
  let email;

  before(() => {
    email = `cy_login_${ts()}@test.com`;
    cy.request('POST', '/api/auth/register', {
      name: 'Cypress Login User',
      email,
      password: 'Cypress@123',
      role: 'patient',
    });
  });

  it('redirects to dashboard after successful login', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type('Cypress@123');
    cy.get('[data-testid="submit-btn"]').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('persists auth state on page reload', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type('Cypress@123');
    cy.get('[data-testid="submit-btn"]').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    cy.reload();
    cy.url().should('not.include', '/login');
  });
});

describe('Login — invalid credentials', () => {
  let email;

  before(() => {
    email = `cy_login_bad_${ts()}@test.com`;
    cy.request('POST', '/api/auth/register', {
      name: 'Cypress Bad Login',
      email,
      password: 'Cypress@123',
      role: 'patient',
    });
  });

  beforeEach(() => {
    cy.visit('/login');
  });

  it('shows error for wrong password', () => {
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type('WRONG_PASSWORD');
    cy.get('[data-testid="submit-btn"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('shows error for non-existent email', () => {
    cy.get('[data-testid="email-input"]').type('ghost_nobody@notreal.com');
    cy.get('[data-testid="password-input"]').type('Cypress@123');
    cy.get('[data-testid="submit-btn"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', '/login');
  });
});

describe('Login — form validation (empty fields)', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('does not submit with empty email', () => {
    cy.get('[data-testid="password-input"]').type('Cypress@123');
    cy.get('[data-testid="submit-btn"]').click();
    // HTML5 required attribute prevents submission — user stays on login
    cy.url().should('include', '/login');
    cy.get('[data-testid="error-message"]').should('not.exist');
  });

  it('does not submit with empty password', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="submit-btn"]').click();
    cy.url().should('include', '/login');
    cy.get('[data-testid="error-message"]').should('not.exist');
  });

  it('does not submit when both fields are empty', () => {
    cy.get('[data-testid="submit-btn"]').click();
    cy.url().should('include', '/login');
  });

  it('rejects malformed email format', () => {
    cy.get('[data-testid="email-input"]').type('not-an-email');
    cy.get('[data-testid="password-input"]').type('Cypress@123');
    cy.get('[data-testid="submit-btn"]').click();
    // HTML5 email validation blocks submission
    cy.url().should('include', '/login');
  });
});
