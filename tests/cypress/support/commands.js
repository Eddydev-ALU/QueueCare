// cy.loginViaApi(email, password) — bypasses the UI and sets auth state directly in localStorage
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request('POST', '/api/auth/login', { email, password }).then((resp) => {
    window.localStorage.setItem('qc_token', resp.body.token);
    window.localStorage.setItem('qc_user', JSON.stringify(resp.body.user));
  });
});

// cy.registerAndLogin(opts) — creates a fresh user, logs in, stores token
Cypress.Commands.add('registerAndLogin', ({ name, email, password, role = 'patient' }) => {
  cy.request('POST', '/api/auth/register', { name, email, password, role });
  cy.loginViaApi(email, password);
});

// cy.createDoctor(adminToken, name) — creates a doctor via API, returns the doctor object
Cypress.Commands.add('createDoctor', (adminToken, name = 'Dr. Cypress') => {
  return cy.request({
    method: 'POST',
    url: '/api/doctors',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { name, specialty: 'Testing' },
  }).its('body');
});

// cy.createAppointment(token, fields) — creates an appointment via API
Cypress.Commands.add('createAppointment', (token, { doctor, date, reason }) => {
  return cy.request({
    method: 'POST',
    url: '/api/appointments',
    headers: { Authorization: `Bearer ${token}` },
    body: { doctor, date, reason },
  }).its('body');
});
