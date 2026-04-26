# Test Report — QueueCare

---

## What I Built

QueueCare is a clinic queue management system with a React frontend (Vite, Tailwind, React Router, Axios) and a Node/Express backend using SQLite via better-sqlite3. The architecture is a simple REST API with JWT authentication. Users have three roles: patient, staff, and admin, enforced by middleware on every protected route. Appointments carry a queue number that auto-increments per date, and a status field that moves from pending to served or cancelled.

For API testing I used Postman with Newman as the CLI runner. Tests are organized as a single collection with four sequential folders: Setup, Happy Path, Negative Cases, and Edge Cases. Environment variables chain state between requests, tokens, IDs, and dynamic dates are all computed and passed forward so the collection runs cleanly top-to-bottom with a single npm test command.

For UI testing I used Cypress with all selectors based on data-testid attributes I added to the JSX, which I did deliberately so the tests would not break if Tailwind classes or element positions changed.

Key decisions: I kept the Postman collection self-contained, it registers its own users, creates its own doctor, and seeds all necessary data, so it can run against any clean instance without manual setup. I also added data-testid attributes as a first-class concern rather than an afterthought, because relying on CSS classes in Cypress tests is one of the most common sources of flakiness.

---

## What I Tested

### API Testing Coverage

I completed comprehensive API coverage across both appointment and authentication flows.

I tested the full CRUD lifecycle for appointments:
- Create appointment
- Read/fetch appointments
- Update appointment
- Cancel/delete appointment

I verified role-based access control on all sensitive endpoints, tested all defined error handling conditions, and covered 7 edge cases, including:
- Date validation issues
- Duplicate booking prevention and booking idempotency

### API Areas Skipped or Partially Covered

I only partially tested the Doctors endpoints:
- I tested doctor creation directly
- Listing and deletion were only used indirectly during setup, not as standalone happy-path tests

I did not test the following queue archive endpoints:
- `/api/queue/dates`
- `/api/queue/date/:date`

Reason for skipping:
- These endpoints require past appointments to exist
- Seeding this cleanly would require manipulating the system clock or directly inserting records into the database

I did not test concurrent requests, therefore:
- No automated validation exists for the race condition in queue number assignment

I did not test JWT token expiry:
- Token lifetime is 24 hours
- No refresh-token flow exists
- Testing expiry would require time mocking or waiting for expiration

### Test Run Screenshots

![Newman Test Results - Setup](./screenshots/Screenshot%202026-04-25%20at%2011.06.37.png)

![Newman Test Results - Happy Path](./screenshots/Screenshot%202026-04-25%20at%2011.06.56.png)

![Newman Test Results - Negative Cases](./screenshots/Screenshot%202026-04-25%20at%2011.07.14.png)

![Newman Test Results - Edge Cases Part 1](./screenshots/Screenshot%202026-04-25%20at%2011.07.27.png)

![Newman Test Results - Edge Cases Part 2](./screenshots/Screenshot%202026-04-25%20at%2011.07.38.png)

![Newman Test Results - Summary](./screenshots/Screenshot%202026-04-25%20at%2011.07.52.png)

![Newman Test Results - Failures](./screenshots/Screenshot%202026-04-25%20at%2011.08.05.png)

---

## What I Automated

Everything in the API section is automated via Newman. All 20 scenarios run headlessly in sequence with a single command.

For the UI, I automated the four flows required by the spec: login, create appointment, form validation, and update/cancel. I drew the line there for the following reasons. The Queue page requires staff credentials, a same-day appointment in the database, and the ability to click a "Mark Served" button, which is achievable but would need careful date seeding, and I prioritised stable tests over maximum coverage. The Dashboard is mostly read-only rendering of counts and recent appointments, which provides low test value relative to effort since the underlying data is already validated at the API level.

Manual testing is more appropriate for the archive page because it requires historical data that is awkward to produce programmatically.

I deliberately used API calls in Cypress before() hooks to set up state rather than driving through the registration and login UI for every test suite. This keeps the tests fast and focused, a UI test for "creating an appointment" should not fail because the registration form has a bug.

---

## Test Cases Conducted

---

### TC-001: Register and login — valid token returned

| Field | Details |
|---|---|
| **Test Case ID** | TC-001 |
| **Test Scenario** | Authentication — happy path |
| **Test Case** | Register a new patient account and verify the login response returns a valid JWT |
| **Pre-conditions** | Backend running on port 5001. No existing account with the test email. |
| **Test Execution Steps** | 1. Send `POST /api/auth/register` with name, email, password, and role. 2. Send `POST /api/auth/login` with the same email and password. 3. Inspect the token and user fields in the response. |
| **Expected Result** | 201 on register. 200 on login. Token is a three-segment JWT string. User object contains id, name, email, and role. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-002: Create appointment — queue number assigned

| Field | Details |
|---|---|
| **Test Case ID** | TC-002 |
| **Test Scenario** | Appointment booking — happy path |
| **Test Case** | Book an appointment and confirm a positive integer queue number is returned in the response |
| **Pre-conditions** | Patient logged in. Valid doctor exists in the database. |
| **Test Execution Steps** | 1. Send `POST /api/appointments` with a valid doctor name, future date, and reason using a patient Bearer token. 2. Inspect the response body. |
| **Expected Result** | 201 Created. `queue_number` is a positive integer. `status` is pending. Doctor and date match the request. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-003: Fetch appointments — patient sees only own records

| Field | Details |
|---|---|
| **Test Case ID** | TC-003 |
| **Test Scenario** | Role-based data filtering — happy path |
| **Test Case** | Patient fetching the appointments list should only receive their own records |
| **Pre-conditions** | Two patient accounts registered and logged in. Each has at least one appointment. |
| **Test Execution Steps** | 1. Send `GET /api/appointments` with patient1 Bearer token. 2. Check every record in the response array. |
| **Expected Result** | 200 OK. All records have `patient_id` matching patient1. Patient2's appointment ID is not in the response. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-004: Fetch appointments — staff sees all records

| Field | Details |
|---|---|
| **Test Case ID** | TC-004 |
| **Test Scenario** | Role-based data filtering — happy path |
| **Test Case** | Staff fetching the appointments list should receive records from all patients |
| **Pre-conditions** | Staff account logged in. At least two patients each have one appointment. |
| **Test Execution Steps** | 1. Send `GET /api/appointments` with staff Bearer token. 2. Check the response array for appointments from multiple patients. |
| **Expected Result** | 200 OK. Response includes appointment IDs belonging to both patient1 and patient2. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-005: Fetch single appointment by ID

| Field | Details |
|---|---|
| **Test Case ID** | TC-005 |
| **Test Scenario** | Appointment retrieval — happy path |
| **Test Case** | Fetch a specific appointment by its ID and verify all required fields are present |
| **Pre-conditions** | Patient logged in. Appointment exists with a known ID. |
| **Test Execution Steps** | 1. Send `GET /api/appointments/:id` with the patient's Bearer token. 2. Inspect all fields in the response. |
| **Expected Result** | 200 OK. Response includes id, patient_id, doctor, date, reason, queue_number, status, patient_name, and patient_email. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-006: Staff marks appointment as served — status confirmed

| Field | Details |
|---|---|
| **Test Case ID** | TC-006 |
| **Test Scenario** | Queue management — happy path |
| **Test Case** | Staff marks a pending appointment as served and the status is verified by a follow-up fetch |
| **Pre-conditions** | Staff account logged in. A pending appointment exists with a known ID. |
| **Test Execution Steps** | 1. Send `PATCH /api/queue/:id/serve` with staff Bearer token. 2. Send `GET /api/appointments/:id` with staff token. 3. Check the status field. |
| **Expected Result** | PATCH returns 200 with success message. Subsequent GET returns the appointment with `status = 'served'`. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-007: Login with wrong password — 401 returned

| Field | Details |
|---|---|
| **Test Case ID** | TC-007 |
| **Test Scenario** | Authentication — negative case |
| **Test Case** | Attempt login with a valid email and an incorrect password |
| **Pre-conditions** | User registered. Backend running. |
| **Test Execution Steps** | 1. Send `POST /api/auth/login` with the correct email and a wrong password. 2. Check the HTTP status and response body. |
| **Expected Result** | 401 Unauthorized. Response body contains an `error` field. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-008: Access protected endpoint with no token — 401 returned

| Field | Details |
|---|---|
| **Test Case ID** | TC-008 |
| **Test Scenario** | Authorization — negative case |
| **Test Case** | Access a protected endpoint without providing any Authorization header |
| **Pre-conditions** | Backend running. |
| **Test Execution Steps** | 1. Send `GET /api/appointments` with no Authorization header. 2. Check the HTTP status and response body. |
| **Expected Result** | 401 Unauthorized. Response body contains an `error` field. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-009: Patient accesses another patient's appointment — 403 returned

| Field | Details |
|---|---|
| **Test Case ID** | TC-009 |
| **Test Scenario** | Authorization — negative case |
| **Test Case** | Patient attempts to fetch an appointment that belongs to a different patient |
| **Pre-conditions** | Two patient accounts registered and logged in. Patient2 has an appointment with a known ID. |
| **Test Execution Steps** | 1. Send `GET /api/appointments/:patient2_appointment_id` using patient1's Bearer token. 2. Check the HTTP status. |
| **Expected Result** | 403 Forbidden. Response body contains an `error` field. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-010: Patient attempts to mark appointment as served — 403 returned

| Field | Details |
|---|---|
| **Test Case ID** | TC-010 |
| **Test Scenario** | Role-based access control — negative case |
| **Test Case** | Patient calls the staff-only serve endpoint |
| **Pre-conditions** | Patient account logged in. An appointment exists with a known ID. |
| **Test Execution Steps** | 1. Send `PATCH /api/queue/:id/serve` using a patient Bearer token. 2. Check the HTTP status. |
| **Expected Result** | 403 Forbidden. Response body contains an `error` field. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-011: Fetch non-existent appointment — 404 returned

| Field | Details |
|---|---|
| **Test Case ID** | TC-011 |
| **Test Scenario** | Error handling — negative case |
| **Test Case** | Request an appointment using an ID that does not exist in the database |
| **Pre-conditions** | Staff account logged in. Backend running. |
| **Test Execution Steps** | 1. Send `GET /api/appointments/99999999` with staff Bearer token. 2. Check the HTTP status and response body. |
| **Expected Result** | 404 Not Found. Response body contains an `error` field. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-012: Book appointment in the past — rejected

| Field | Details |
|---|---|
| **Test Case ID** | TC-012 |
| **Test Scenario** | Date validation — edge case |
| **Test Case** | Attempt to book an appointment using yesterday's date via direct API call |
| **Pre-conditions** | Patient logged in. Valid doctor exists. |
| **Test Execution Steps** | 1. Compute yesterday's date in YYYY-MM-DD format. 2. Send `POST /api/appointments` with the past date, a valid doctor, and a reason. 3. Check the HTTP status. |
| **Expected Result** | 400 Bad Request. Error message indicates past dates are not allowed. |
| **Actual Result (before fix)** | 201 Created. Appointment was stored with a past date. |
| **Status** | Fail — Fixed |
| **Bug ID** | BUG-002 |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-013: Duplicate booking on the same day — rejected

| Field | Details |
|---|---|
| **Test Case ID** | TC-013 |
| **Test Scenario** | Booking idempotency — edge case |
| **Test Case** | Patient sends a second booking request for a date they already have an active appointment on |
| **Pre-conditions** | Patient logged in. Patient already has a pending appointment on a specific future date. |
| **Test Execution Steps** | 1. Send `POST /api/appointments` with the same future date already booked by the patient. 2. Check the HTTP status of the second request. |
| **Expected Result** | 409 Conflict. Error message states the patient already has an appointment on that date. |
| **Actual Result (before fix)** | 201 Created. Duplicate appointment was booked without any error. |
| **Status** | Fail — Fixed |
| **Bug ID** | BUG-003 |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-014: Invalid date format submitted — rejected

| Field | Details |
|---|---|
| **Test Case ID** | TC-014 |
| **Test Scenario** | Input validation — edge case |
| **Test Case** | Submit a non-date string as the appointment date |
| **Pre-conditions** | Patient logged in. Valid doctor exists. |
| **Test Execution Steps** | 1. Send `POST /api/appointments` with `"date": "not-a-date"`, a valid doctor, and a reason. 2. Check the HTTP status. |
| **Expected Result** | 400 Bad Request. Error message describes the invalid date format. |
| **Actual Result (before fix)** | 201 Created. The invalid string was stored in the database as the appointment date. |
| **Status** | Fail — Fixed |
| **Bug ID** | BUG-004 |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-015: Cancel already-cancelled appointment — handled gracefully

| Field | Details |
|---|---|
| **Test Case ID** | TC-015 |
| **Test Scenario** | Idempotency / graceful error handling — edge case |
| **Test Case** | Attempt to cancel an appointment that has already been cancelled |
| **Pre-conditions** | Patient logged in. An appointment has already been cancelled (DELETE called once successfully). |
| **Test Execution Steps** | 1. Send `DELETE /api/appointments/:id` a second time on an already-cancelled appointment. 2. Check the HTTP status and error message. |
| **Expected Result** | 400 Bad Request. Error message states the appointment is already cancelled. |
| **Actual Result (before fix)** | 404 Not Found. The first DELETE had permanently removed the row so the record no longer existed. |
| **Status** | Fail — Fixed |
| **Bug ID** | BUG-001 |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-016: Mark already-served appointment as served again — handled gracefully

| Field | Details |
|---|---|
| **Test Case ID** | TC-016 |
| **Test Scenario** | Graceful error handling — edge case |
| **Test Case** | Staff attempts to serve an appointment that is already marked as served |
| **Pre-conditions** | Staff logged in. Appointment already has `status = 'served'`. |
| **Test Execution Steps** | 1. Send `PATCH /api/queue/:id/serve` on an appointment that was already served. 2. Check the HTTP status and response. |
| **Expected Result** | 400 Bad Request. Error message states the patient is already marked as served. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-017: Re-book on same day after cancellation — allowed

| Field | Details |
|---|---|
| **Test Case ID** | TC-017 |
| **Test Scenario** | Re-booking after cancellation — edge case |
| **Test Case** | Patient cancels an appointment then books a new one on the same date |
| **Pre-conditions** | Patient logged in. A previous appointment on a specific future date has been cancelled. |
| **Test Execution Steps** | 1. Send `POST /api/appointments` with the same date as the cancelled appointment using the same patient token. 2. Check the HTTP status and response body. |
| **Expected Result** | 201 Created. New appointment has a queue number and status of pending. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Backend — Node.js/Express, port 5001, SQLite |

---

### TC-018: UI — Login with valid credentials redirects to dashboard

| Field | Details |
|---|---|
| **Test Case ID** | TC-018 |
| **Test Scenario** | Authentication — UI happy path |
| **Test Case** | User completes the login form with correct credentials and is redirected to the dashboard |
| **Pre-conditions** | Frontend running on port 5173. Backend running on port 5001. Registered user exists. Browser opened at `/login`. |
| **Test Execution Steps** | 1. Type the registered email into the email field. 2. Type the correct password into the password field. 3. Click Sign In. 4. Observe the URL. |
| **Expected Result** | Browser redirects to `/` (dashboard). User is authenticated. |
| **Actual Result** | As expected. |
| **Status** | Pass |
| **Bug ID** | — |
| **Environment** | Frontend — React/Vite port 5173, Backend port 5001, Cypress with Chrome |

---

### TC-019: UI — Login with invalid credentials shows error message

| Field | Details |
|---|---|
| **Test Case ID** | TC-019 |
| **Test Scenario** | Authentication error handling — UI negative case |
| **Test Case** | User enters wrong password and an error message is displayed without redirecting the page |
| **Pre-conditions** | Frontend running on port 5173. Backend running on port 5001. Registered user exists. Browser at `/login`. |
| **Test Execution Steps** | 1. Type the correct email into the email field. 2. Type an incorrect password. 3. Click Sign In. 4. Observe the page. |
| **Expected Result** | Error message appears on the login page. URL remains `/login`. No page reload occurs. |
| **Actual Result (before fix)** | Page silently reloaded with no error message. The Axios interceptor redirected to `/login` before React could set the error state. |
| **Status** | Fail — Fixed |
| **Bug ID** | BUG-007 |
| **Environment** | Frontend — React/Vite port 5173, Backend port 5001, Cypress with Chrome |

---

### TC-020: UI — Cancel appointment updates status badge in the list

| Field | Details |
|---|---|
| **Test Case ID** | TC-020 |
| **Test Scenario** | Appointment management — UI cancel flow |
| **Test Case** | Patient cancels a pending appointment and the row updates to show a cancelled status badge |
| **Pre-conditions** | Frontend running on port 5173. Backend running on port 5001. Patient logged in. At least one pending appointment visible on the `/appointments` page. |
| **Test Execution Steps** | 1. Navigate to `/appointments`. 2. Click Cancel on a pending appointment row. 3. Confirm the browser dialog. 4. Observe the appointments list. |
| **Expected Result** | The appointment row remains visible with the status badge updated to "cancelled". The Edit and Cancel buttons disappear from that row. |
| **Actual Result (before fix)** | The appointment row was removed entirely from the list. No cancelled status was shown and no record of the cancellation remained visible to the patient. |
| **Status** | Fail — Fixed |
| **Bug ID** | BUG-008 |
| **Environment** | Frontend — React/Vite port 5173, Backend port 5001, Cypress with Chrome |

---

## Bugs Found

---

### Bug 1: Cancel was a hard delete

| Field | Details |
|---|---|
| **Bug ID** | BUG-001 |
| **Test Scenario** | Cancelling an appointment should soft-delete it and prevent re-cancellation |
| **Pre-conditions** | Backend running. Patient user registered and logged in. At least one pending appointment exists. |
| **Steps to Reproduce** | 1. Send `DELETE /api/appointments/:id` with a valid patient Bearer token. 2. Note the HTTP response. 3. Send `DELETE /api/appointments/:id` again with the same ID. 4. Note the HTTP response. |
| **Expected Result** | First DELETE returns 200 with cancellation message. Second DELETE returns 400 with "already cancelled". Appointment row remains in database with `status = 'cancelled'`. |
| **Actual Result** | First DELETE permanently removed the row and returned 200. Second DELETE returned 404 "Appointment not found". |
| **Status** | Fail — Fixed |

---

### Bug 2: No past date validation on the API

| Field | Details |
|---|---|
| **Bug ID** | BUG-002 |
| **Test Scenario** | Booking an appointment with a past date should be rejected by the API |
| **Pre-conditions** | Backend running. Patient user registered and logged in. A valid doctor exists. |
| **Steps to Reproduce** | 1. Compute yesterday's date in YYYY-MM-DD format. 2. Send `POST /api/appointments` with the past date, a valid doctor, and a reason. 3. Note the HTTP response. |
| **Expected Result** | 400 Bad Request with an error message indicating past dates are not allowed. |
| **Actual Result** | 201 Created — appointment was booked with a past date without any error. |
| **Status** | Fail — Fixed |

---

### Bug 3: No duplicate booking protection

| Field | Details |
|---|---|
| **Bug ID** | BUG-003 |
| **Test Scenario** | A patient should not be able to book two active appointments on the same date |
| **Pre-conditions** | Backend running. Patient user registered and logged in. A valid doctor exists. Patient already has a pending appointment on a specific future date. |
| **Steps to Reproduce** | 1. Send `POST /api/appointments` with a future date (first booking succeeds). 2. Send `POST /api/appointments` again with the exact same date and the same patient token. 3. Note the HTTP response of the second request. |
| **Expected Result** | 409 Conflict with error message "You already have an appointment on this date". |
| **Actual Result** | 201 Created — the duplicate appointment was booked without any error. |
| **Status** | Fail — Fixed |

---

### Bug 4: No date format validation

| Field | Details |
|---|---|
| **Bug ID** | BUG-004 |
| **Test Scenario** | Submitting a malformed date string should return a clear validation error |
| **Pre-conditions** | Backend running. Patient user registered and logged in. A valid doctor exists. |
| **Steps to Reproduce** | 1. Send `POST /api/appointments` with `"date": "not-a-date"`, a valid doctor, and a reason. 2. Note the HTTP response. |
| **Expected Result** | 400 Bad Request with an error message about the invalid date format. |
| **Actual Result** | 201 Created — the invalid string was stored in the database as the appointment date. |
| **Status** | Fail — Fixed |

---

### Bug 5: Race condition in queue number assignment

| Field | Details |
|---|---|
| **Bug ID** | BUG-005 |
| **Test Scenario** | Two simultaneous bookings for the same date should each receive a unique queue number |
| **Pre-conditions** | Backend running. Two patient accounts registered and logged in. A valid doctor exists. |
| **Steps to Reproduce** | 1. Send two simultaneous `POST /api/appointments` requests for the same date from two different patient accounts. 2. Compare the `queue_number` values in both responses. |
| **Expected Result** | Each appointment receives a distinct, unique queue number. |
| **Actual Result** | Both appointments can receive the same queue number when requests arrive simultaneously, because the number is computed with a separate SELECT then INSERT with no locking. |
| **Status** | Fail — Not yet fixed |

---

### Bug 6: Password length only enforced on the frontend

| Field | Details |
|---|---|
| **Bug ID** | BUG-006 |
| **Test Scenario** | Registering with a password shorter than 6 characters via direct API call should be rejected |
| **Pre-conditions** | Backend running. |
| **Steps to Reproduce** | 1. Send `POST /api/auth/register` with `name`, `email`, and `"password": "ab"` (2 characters). 2. Note the HTTP response. |
| **Expected Result** | 400 Bad Request with an error about minimum password length. |
| **Actual Result** | 201 Created — the account was registered with a 2-character password. |
| **Status** | Fail — Not yet fixed |

---

### Bug 7: Axios interceptor redirected to login on any 401, including from the login endpoint itself

| Field | Details |
|---|---|
| **Bug ID** | BUG-007 |
| **Test Scenario** | A failed login attempt should display an error message without redirecting the page |
| **Pre-conditions** | Frontend and backend running. A registered user exists in the database. |
| **Steps to Reproduce** | 1. Navigate to `/login`. 2. Enter the correct email and an incorrect password. 3. Click Sign In. 4. Observe the UI response. |
| **Expected Result** | An error message appears on the login page. The URL remains `/login`. No page reload occurs. |
| **Actual Result** | The page silently reloaded with no error message visible. The Axios interceptor caught the 401, cleared localStorage, and forced a redirect before React could set the error state. |
| **Status** | Fail — Fixed |

---

### Bug 8: Frontend cancel handler removed the appointment instead of marking it cancelled

| Field | Details |
|---|---|
| **Bug ID** | BUG-008 |
| **Test Scenario** | Cancelling an appointment should update its status badge to cancelled in the appointments list |
| **Pre-conditions** | Frontend and backend running. Patient logged in with at least one pending appointment visible in the list. |
| **Steps to Reproduce** | 1. Navigate to `/appointments`. 2. Click Cancel on a pending appointment row. 3. Confirm the browser dialog. 4. Observe the appointments list. |
| **Expected Result** | The appointment row remains visible with the status badge updated to "cancelled". The Edit and Cancel buttons disappear from that row. |
| **Actual Result** | The appointment row was removed entirely from the list. No cancelled status was shown and patients had no record of their cancelled appointments in the UI. |
| **Status** | Fail — Fixed |

---

## What I Would Improve

The queue number race condition should be fixed properly, either by adding a UNIQUE constraint on `(date, queue_number)` and retrying on conflict, or by wrapping the read-increment-insert in a SQLite transaction with serialized writes. The current approach is fine for a single-user demo but would break under any real concurrent load.

I would add backend password validation, minimum length, ideally with a complexity check, and make it consistent with whatever the frontend enforces.

The soft delete change revealed a secondary issue: the appointments list now shows cancelled appointments indefinitely. Patients accumulate a long list of old cancelled entries with no way to dismiss them. I would add a filter toggle, "show only active", defaulting to hiding cancelled entries.

On the test side I would add tests for the queue serve flow via the UI, and I would add a test that verifies the queue number is unique per date even under two near-simultaneous bookings. I would also add a test for token expiry behavior and test the `/api/queue/dates` archive endpoint by seeding past-dated appointments directly into the test database rather than waiting for real time to pass.

Finally, I would add a `package.json` script at the root level that starts the backend, waits for it to be ready, then runs the Newman suite, so the entire API test suite can be run with a single command from the project root without manually starting the server first.
