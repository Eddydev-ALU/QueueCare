# Test Report — QueueCare

---

## What You Built

QueueCare is a clinic queue management system with a React frontend (Vite, Tailwind, React Router, Axios) and a Node/Express backend using SQLite via better-sqlite3. The architecture is a simple REST API with JWT authentication. Users have three roles: patient, staff, and admin, enforced by middleware on every protected route. Appointments carry a queue number that auto-increments per date, and a status field that moves from pending to served or cancelled.

For API testing I used Postman with Newman as the CLI runner. Tests are organized as a single collection with four sequential folders: Setup, Happy Path, Negative Cases, and Edge Cases. Environment variables chain state between requests, tokens, IDs, and dynamic dates are all computed and passed forward so the collection runs cleanly top-to-bottom with a single npm test command.

For UI testing I used Cypress with all selectors based on data-testid attributes I added to the JSX, which I did deliberately so the tests would not break if Tailwind classes or element positions changed.

Key decisions: I kept the Postman collection self-contained, it registers its own users, creates its own doctor, and seeds all necessary data, so it can run against any clean instance without manual setup. I also added data-testid attributes as a first-class concern rather than an afterthought, because relying on CSS classes in Cypress tests is one of the most common sources of flakiness.

---

## What You Tested

### API Testing Coverage

Comprehensive API coverage was completed across both appointment and authentication flows.

Tested the full CRUD lifecycle for appointments:
- Create appointment
- Read/fetch appointments
- Update appointment
- Cancel/delete appointment

Verified role-based access control on all sensitive endpoints. Tested all defined error handling conditions. Covered 7 edge cases, including:
- Date validation issues
- Duplicate booking prevention and booking idempotency

### API Areas Skipped or Partially Covered

Doctors endpoints were only partially tested:
- Doctor creation was tested directly
- Listing and deletion were only used indirectly during setup, not as standalone happy-path tests

The following queue archive endpoints were not tested:
- `/api/queue/dates`
- `/api/queue/date/:date`

Reason for skipping:
- These endpoints require past appointments to exist
- Seeding this cleanly would require manipulating the system clock or directly inserting records into the database

Concurrent requests were not tested, therefore:
- No automated validation exists for the race condition in queue number assignment

JWT token expiry was not tested:
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

## What You Automated

Everything in the API section is automated via Newman. All 20 scenarios run headlessly in sequence with a single command.

For the UI, I automated the four flows required by the spec: login, create appointment, form validation, and update/cancel. I drew the line there for the following reasons. The Queue page requires staff credentials, a same-day appointment in the database, and the ability to click a "Mark Served" button, which is achievable but would need careful date seeding, and I prioritised stable tests over maximum coverage. The Dashboard is mostly read-only rendering of counts and recent appointments, which provides low test value relative to effort since the underlying data is already validated at the API level.

Manual testing is more appropriate for the archive page because it requires historical data that is awkward to produce programmatically.

I deliberately used API calls in Cypress before() hooks to set up state rather than driving through the registration and login UI for every test suite. This keeps the tests fast and focused, a UI test for "creating an appointment" should not fail because the registration form has a bug.

---

## Bugs Found

**Bug 1: Cancel was a hard delete.**

The original `DELETE /api/appointments/:id` endpoint executed `DELETE FROM appointments`, permanently removing the appointment record from the database. As a result:
- Cancelled appointments disappeared from the patient history
- No audit trail was preserved
- The system could not distinguish between cancelled and never-existing appointments
- The edge case "cancelling an already-cancelled appointment" was impossible to test

This was corrected by implementing a soft delete where appointment rows are retained and `status = 'cancelled'` is assigned instead.

Impact: This was the most significant issue because it directly affected data integrity and traceability.

---

**Bug 2: No past date validation on the API.**

The frontend booking form used a `min` attribute on the date picker to prevent users from selecting past dates. However:
- The backend API accepted any submitted date string without verification
- A direct API request with yesterday's date could still create an appointment successfully
- This represents a classic frontend-only validation flaw where browser restrictions can be bypassed by any external client

Impact: Invalid appointments could be stored despite appearing blocked in the UI.

---

**Bug 3: No duplicate booking protection.**

A patient was able to create multiple appointments for the same day by sending repeated API requests. There was no backend uniqueness validation on the combination of `patient_id` and `date`.
- The frontend naturally redirects users after one booking, so the problem is not obvious through normal UI interaction
- This is likely why the defect was not noticed during manual use
- It is easily reproducible using direct API tools such as curl or Postman

Impact: The system allowed duplicate same-day bookings for a single patient.

---

**Bug 4: No date format validation.**

The `POST /api/appointments` endpoint accepted malformed date values such as `"not-a-date"` or `"15/05/2026"`.
- SQLite stored these invalid strings without rejection
- Queue number assignment was still executed normally even though the date was nonsensical
- This resulted in appointments that existed in the database but would never correctly appear in date-based queue listings

Impact: Corrupted scheduling records could be introduced into the system.

---

**Bug 5: Race condition in queue number assignment.**

Queue number generation followed this sequence: `SELECT MAX(queue_number) WHERE date = ?` followed by a separate INSERT. If two booking requests arrive at nearly the same time for the same date:
- Both requests can read the same current maximum queue number
- Both can insert the same next queue number
- This creates duplicate queue positions

SQLite's single-writer behavior reduces the likelihood under low traffic, but the implementation is still unsafe under concurrent load.

Impact: Queue ordering can become inconsistent in high-traffic scenarios.

---

**Bug 6: Password length only enforced on the frontend.**

The registration form contains `minLength={6}`, which prevents short passwords only in the browser UI. The backend `/api/auth/register` endpoint had no password length validation. Therefore:
- A direct API request could successfully create accounts with one-character passwords or other insecure credentials
- This again demonstrates a frontend-only validation weakness

Impact: Weak user credentials could be stored, reducing account security.

---

**Bug 7: Axios interceptor redirected to login on any 401, including from the login endpoint itself.**

- The response interceptor in `api/index.js` caught every 401 unconditionally and redirected to `/login`
- When a user entered wrong credentials, the login request returned 401
- The interceptor immediately cleared localStorage and forced a page reload
- React never had a chance to set the error state
- The error message never appeared and the page silently reloaded
- Fixed by skipping the redirect when the failing request came from an auth endpoint
- Cypress caught this because it observed a page load event firing immediately after the 401, something manual testing would miss since the redirect is instantaneous and the page looks identical after reloading

Impact: Login errors were completely invisible to the user, making it impossible to understand why sign-in failed.

---

**Bug 8: Frontend cancel handler removed the appointment from state instead of marking it cancelled.**

- After a successful cancellation, `Appointments.jsx` called `prev.filter()` to remove the cancelled row from local state entirely
- This was written for a hard-delete backend, but after changing the backend to soft delete the two sides were out of sync
- The appointment disappeared from the patient's list instead of showing a cancelled status badge
- Patients had no record of their cancelled appointments in the UI
- Fixed by changing the state update to `prev.map()`, keeping the row but flipping its status to cancelled
- This also naturally removes the Edit and Cancel action buttons since they only render for pending appointments
- Cypress caught this because the test correctly expected the row to remain visible with an updated status badge

Impact: Patients lost visibility of their cancelled booking history after every cancellation.

---

## What I Would Improve

The queue number race condition should be fixed properly, either by adding a UNIQUE constraint on `(date, queue_number)` and retrying on conflict, or by wrapping the read-increment-insert in a SQLite transaction with serialized writes. The current approach is fine for a single-user demo but would break under any real concurrent load.

I would add backend password validation, minimum length, ideally with a complexity check, and make it consistent with whatever the frontend enforces.

The soft delete change revealed a secondary issue: the appointments list now shows cancelled appointments indefinitely. Patients accumulate a long list of old cancelled entries with no way to dismiss them. I would add a filter toggle, "show only active", defaulting to hiding cancelled entries.

On the test side I would add tests for the queue serve flow via the UI, and I would add a test that verifies the queue number is unique per date even under two near-simultaneous bookings. I would also add a test for token expiry behavior and test the `/api/queue/dates` archive endpoint by seeding past-dated appointments directly into the test database rather than waiting for real time to pass.

Finally, I would add a `package.json` script at the root level that starts the backend, waits for it to be ready, then runs the Newman suite, so the entire API test suite can be run with a single command from the project root without manually starting the server first.
