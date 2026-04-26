# QueueCare

A clinic queue management system. Patients book appointments, staff manage the daily queue, and admins control the doctor roster.

---

## Prerequisites

- Node.js v18 or higher
- npm

---

## Project Structure

```
QueueCare/
├── backend/       Express API, SQLite database
├── frontend/      React application (Vite)
└── tests/
    └── api/       Postman collection and Newman runner
```

---

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### API Tests (Newman)

```bash
cd tests/api
npm install
```

---

## Running the Application

Both servers must be running for the application and UI tests to work. Open two separate terminal windows.

**Terminal 1 — backend (port 5001):**

```bash
cd backend
npm run dev
```

**Terminal 2 — frontend (port 5173):**

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## User Roles

| Role    | Capabilities                                                        |
|---------|---------------------------------------------------------------------|
| patient | Book, view, edit, and cancel own appointments                       |
| staff   | View all appointments, mark patients as served, view queue archive  |
| admin   | All staff capabilities plus adding and removing doctors             |

To create a staff or admin account, select the role from the dropdown on the registration page.

---

## Running the Tests

### API Tests — Postman / Newman

Requires the backend server to be running on port 5001.

```bash
cd tests/api
npm test
```

This runs the full Postman collection through Newman and prints results to the terminal. The collection is self-contained — it registers its own test users and seeds all required data on each run.

To generate an HTML report instead:

```bash
npm run test:html
```

The report is saved to `tests/api/report.html`.

You can also import the collection manually into Postman:

- Collection: `tests/api/QueueCare.postman_collection.json`
- Environment: `tests/api/QueueCare.postman_environment.json`

### UI Tests — Cypress

Requires both the backend (port 5001) and frontend (port 5173) servers to be running.

**Interactive mode (opens the Cypress UI):**

```bash
cd frontend
npm run cy:open
```

Select E2E Testing, then choose Chrome or Electron as the browser.

**Headless mode (runs in the terminal, for CI):**

```bash
cd frontend
npm run cy:run
```

#### Test Files

| File | What it covers |
|------|----------------|
| `cypress/e2e/auth/login.cy.js` | Login with valid credentials, invalid credentials, empty and malformed form submission |
| `cypress/e2e/appointments/create-appointment.cy.js` | Booking a new appointment, verifying it appears in the list with correct status and queue number, form validation |
| `cypress/e2e/appointments/manage-appointments.cy.js` | Editing an appointment, cancelling an appointment, role-based view differences between patient and staff |

---

## Environment Variables

The backend reads from `backend/.env`. The file is included in the repository with development defaults and does not require any changes to run locally.

```
PORT=5001
JWT_SECRET=queuecare_dev_secret_key_change_in_production
```

Change `JWT_SECRET` to a strong random value before any non-local deployment.
