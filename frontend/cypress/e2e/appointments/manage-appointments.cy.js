// Update and Cancel flows — make a change and verify it is reflected in the UI

const futureDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

describe('Update Appointment', () => {
  let patientEmail;
  let adminEmail;
  let adminToken;
  let patientToken;
  let doctorName;
  let appointmentId;

  before(() => {
    const ts = Date.now();
    patientEmail = `cy_update_patient_${ts}@test.com`;
    adminEmail = `cy_update_admin_${ts}@test.com`;
    doctorName = `Dr. Update ${ts}`;

    cy.request('POST', '/api/auth/register', {
      name: 'Update Admin',
      email: adminEmail,
      password: 'Cypress@123',
      role: 'admin',
    });
    cy.request('POST', '/api/auth/register', {
      name: 'Update Patient',
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

    cy.request('POST', '/api/auth/login', { email: patientEmail, password: 'Cypress@123' })
      .then((resp) => {
        patientToken = resp.body.token;
        return cy.request({
          method: 'POST',
          url: '/api/appointments',
          headers: { Authorization: `Bearer ${patientToken}` },
          body: { doctor: doctorName, date: futureDate(50), reason: 'Original reason' },
        });
      })
      .then((resp) => {
        appointmentId = resp.body.id;
      });
  });

  it('updates the appointment reason and reflects the change in the list', () => {
    cy.loginViaApi(patientEmail, 'Cypress@123');
    cy.visit('/appointments');

    cy.get('[data-testid="appointments-table"]').should('be.visible');
    cy.contains('Original reason')
      .closest('[data-testid="appointment-row"]')
      .within(() => {
        cy.get('[data-testid="edit-btn"]').click();
      });

    cy.url().should('include', '/edit');
    const updatedReason = `Updated reason ${Date.now()}`;
    cy.get('[data-testid="reason-input"]').clear().type(updatedReason);
    cy.get('[data-testid="submit-btn"]').click();

    cy.url().should('include', '/appointments');
    cy.contains(updatedReason).should('be.visible');
    cy.contains('Original reason').should('not.exist');
  });

  it('updates the appointment date and reflects the change', () => {
    cy.loginViaApi(patientEmail, 'Cypress@123');
    cy.visit('/appointments');

    cy.get('[data-testid="appointment-row"]').first().within(() => {
      cy.get('[data-testid="edit-btn"]').click();
    });

    cy.url().should('include', '/edit');
    const newDate = futureDate(55);
    cy.get('[data-testid="date-input"]').clear().type(newDate);
    cy.get('[data-testid="submit-btn"]').click();

    cy.url().should('include', '/appointments');
    cy.contains(newDate).should('be.visible');
  });
});

describe('Cancel Appointment', () => {
  let patientEmail;
  let adminEmail;
  let adminToken;
  let patientToken;
  let doctorName;

  before(() => {
    const ts = Date.now();
    patientEmail = `cy_cancel_patient_${ts}@test.com`;
    adminEmail = `cy_cancel_admin_${ts}@test.com`;
    doctorName = `Dr. Cancel ${ts}`;

    cy.request('POST', '/api/auth/register', {
      name: 'Cancel Admin',
      email: adminEmail,
      password: 'Cypress@123',
      role: 'admin',
    });
    cy.request('POST', '/api/auth/register', {
      name: 'Cancel Patient',
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

    cy.request('POST', '/api/auth/login', { email: patientEmail, password: 'Cypress@123' })
      .then((resp) => {
        patientToken = resp.body.token;
        return cy.request({
          method: 'POST',
          url: '/api/appointments',
          headers: { Authorization: `Bearer ${patientToken}` },
          body: { doctor: doctorName, date: futureDate(60), reason: 'To be cancelled' },
        });
      });
  });

  it('cancels an appointment and the status updates to cancelled in the list', () => {
    cy.loginViaApi(patientEmail, 'Cypress@123');
    cy.visit('/appointments');

    cy.get('[data-testid="appointments-table"]').should('be.visible');
    cy.contains('To be cancelled')
      .closest('[data-testid="appointment-row"]')
      .within(() => {
        cy.get('[data-testid="cancel-btn"]').click();
      });

    // Confirm the browser dialog
    cy.on('window:confirm', () => true);

    // After cancellation, the status badge updates or row action buttons disappear
    cy.contains('To be cancelled')
      .closest('[data-testid="appointment-row"]')
      .within(() => {
        cy.get('[data-testid="appointment-status"]').should('have.text', 'cancelled');
        cy.get('[data-testid="cancel-btn"]').should('not.exist');
        cy.get('[data-testid="edit-btn"]').should('not.exist');
      });
  });
});

describe('Appointments list — role-based view', () => {
  let patientEmail;
  let staffEmail;
  let adminEmail;
  let adminToken;
  let staffToken;
  let patientToken;
  let doctorName;

  before(() => {
    const ts = Date.now();
    patientEmail = `cy_rbac_patient_${ts}@test.com`;
    staffEmail = `cy_rbac_staff_${ts}@test.com`;
    adminEmail = `cy_rbac_admin_${ts}@test.com`;
    doctorName = `Dr. RBAC ${ts}`;

    cy.request('POST', '/api/auth/register', {
      name: 'RBAC Admin', email: adminEmail, password: 'Cypress@123', role: 'admin',
    });
    cy.request('POST', '/api/auth/register', {
      name: 'RBAC Staff', email: staffEmail, password: 'Cypress@123', role: 'staff',
    });
    cy.request('POST', '/api/auth/register', {
      name: 'RBAC Patient', email: patientEmail, password: 'Cypress@123', role: 'patient',
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

    cy.request('POST', '/api/auth/login', { email: patientEmail, password: 'Cypress@123' })
      .then((resp) => {
        patientToken = resp.body.token;
        return cy.request({
          method: 'POST',
          url: '/api/appointments',
          headers: { Authorization: `Bearer ${patientToken}` },
          body: { doctor: doctorName, date: futureDate(70), reason: 'Patient RBAC test' },
        });
      });
  });

  it('patient sees "My Appointments" heading (own appointments only)', () => {
    cy.loginViaApi(patientEmail, 'Cypress@123');
    cy.visit('/appointments');
    cy.contains('My Appointments').should('be.visible');
    // Patient column is not rendered for patient view
    cy.get('th').contains('Patient').should('not.exist');
  });

  it('staff sees "All Appointments" heading and Patient column', () => {
    cy.loginViaApi(staffEmail, 'Cypress@123');
    cy.visit('/appointments');
    cy.contains('All Appointments').should('be.visible');
    cy.get('th').contains('Patient').should('be.visible');
  });
});
