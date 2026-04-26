// Create appointment flow — fill and submit the form, verify the booking appears
// Form validation — empty fields, invalid input formats

const futureDate = (daysAhead = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

describe('Create Appointment', () => {
  let patientEmail;
  let adminEmail;
  let adminToken;
  let doctorName;

  before(() => {
    const ts = Date.now();
    patientEmail = `cy_create_patient_${ts}@test.com`;
    adminEmail = `cy_create_admin_${ts}@test.com`;
    doctorName = `Dr. Cypress ${ts}`;

    // Register admin and patient
    cy.request('POST', '/api/auth/register', {
      name: 'Cypress Admin',
      email: adminEmail,
      password: 'Cypress@123',
      role: 'admin',
    });
    cy.request('POST', '/api/auth/register', {
      name: 'Cypress Patient',
      email: patientEmail,
      password: 'Cypress@123',
      role: 'patient',
    });

    // Get admin token and create a doctor
    cy.request('POST', '/api/auth/login', { email: adminEmail, password: 'Cypress@123' })
      .then((resp) => {
        adminToken = resp.body.token;
        return cy.request({
          method: 'POST',
          url: '/api/doctors',
          headers: { Authorization: `Bearer ${adminToken}` },
          body: { name: doctorName, specialty: 'Testing' },
        });
      });
  });

  beforeEach(() => {
    cy.loginViaApi(patientEmail, 'Cypress@123');
    cy.visit('/appointments/new');
  });

  it('doctor select is populated with available doctors', () => {
    cy.get('[data-testid="doctor-select"]').should('be.visible');
    cy.get('[data-testid="doctor-select"] option').should('have.length.above', 0);
  });

  it('successfully books an appointment and redirects to appointments list', () => {
    cy.get('[data-testid="doctor-select"]').select(doctorName);
    cy.get('[data-testid="date-input"]').type(futureDate(30));
    cy.get('[data-testid="reason-input"]').type('Annual checkup via Cypress');
    cy.get('[data-testid="submit-btn"]').click();

    cy.url().should('include', '/appointments');
    cy.get('[data-testid="appointments-table"]').should('be.visible');
    cy.get('[data-testid="appointment-row"]').should('have.length.above', 0);
  });

  it('new appointment appears in the appointments list', () => {
    const reason = `Cypress test booking ${Date.now()}`;
    cy.get('[data-testid="doctor-select"]').select(doctorName);
    cy.get('[data-testid="date-input"]').type(futureDate(31));
    cy.get('[data-testid="reason-input"]').type(reason);
    cy.get('[data-testid="submit-btn"]').click();

    cy.url().should('include', '/appointments');
    cy.contains(reason).should('be.visible');
  });

  it('shows pending status and a queue number for the new booking', () => {
    const reason = `Queue check ${Date.now()}`;
    cy.get('[data-testid="doctor-select"]').select(doctorName);
    cy.get('[data-testid="date-input"]').type(futureDate(32));
    cy.get('[data-testid="reason-input"]').type(reason);
    cy.get('[data-testid="submit-btn"]').click();

    cy.url().should('include', '/appointments');
    cy.contains(reason)
      .closest('[data-testid="appointment-row"]')
      .within(() => {
        cy.get('[data-testid="appointment-status"]').should('have.text', 'pending');
        cy.contains(/#\d+/).should('exist');
      });
  });
});

describe('Create Appointment — form validation', () => {
  let patientEmail;
  let adminEmail;
  let adminToken;
  let doctorName;

  before(() => {
    const ts = Date.now();
    patientEmail = `cy_formval_patient_${ts}@test.com`;
    adminEmail = `cy_formval_admin_${ts}@test.com`;
    doctorName = `Dr. FormVal ${ts}`;

    cy.request('POST', '/api/auth/register', {
      name: 'FormVal Admin',
      email: adminEmail,
      password: 'Cypress@123',
      role: 'admin',
    });
    cy.request('POST', '/api/auth/register', {
      name: 'FormVal Patient',
      email: patientEmail,
      password: 'Cypress@123',
      role: 'patient',
    });
    cy.request('POST', '/api/auth/login', { email: adminEmail, password: 'Cypress@123' })
      .then((resp) => {
        adminToken = resp.body.token;
        return cy.request({
          method: 'POST',
          url: '/api/doctors',
          headers: { Authorization: `Bearer ${adminToken}` },
          body: { name: doctorName, specialty: 'Testing' },
        });
      });
  });

  beforeEach(() => {
    cy.loginViaApi(patientEmail, 'Cypress@123');
    cy.visit('/appointments/new');
  });

  it('does not submit without a date', () => {
    cy.get('[data-testid="doctor-select"]').select(doctorName);
    cy.get('[data-testid="date-input"]').clear();
    cy.get('[data-testid="reason-input"]').type('No date test');
    cy.get('[data-testid="submit-btn"]').click();
    cy.url().should('include', '/appointments/new');
  });

  it('does not submit without a reason', () => {
    cy.get('[data-testid="doctor-select"]').select(doctorName);
    cy.get('[data-testid="date-input"]').type(futureDate(40));
    cy.get('[data-testid="submit-btn"]').click();
    cy.url().should('include', '/appointments/new');
  });
});
