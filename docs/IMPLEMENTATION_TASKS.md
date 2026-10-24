# FixFlow — Implementation Checklist

This checklist turns the existing project documents into small, dependency-ordered implementation tasks. It is a work plan, not evidence that planned behavior exists. Requirements and unresolved decisions are linked to the source documents rather than restated in full.

## Baseline and conventions

- The backend directory currently has the Phase 4 bootstrap: `backend/package.json`, `backend/src/app.js`, `backend/src/server.js`, `backend/src/middlewares/errorHandler.js`, `.env`, `.env.example`, and `.gitignore`.
- Phase 4 dependencies and the health/404 behavior were reported verified in `07_PROJECT_STATUS.md`. No database connection, feature modules, API tests, API docs, or deployment configuration are present.
- The `backend/` directory is not currently inside a Git worktree. The status checkbox for repository initialization remains unchecked.
- A previous `npm audit` reported three high-severity findings in the development-only `nodemon` dependency chain; `npm audit --omit=dev` reported none. Re-run the audit and record the disposition before deployment.
- Status values below describe actual implementation, not the task's place in the plan. Use only `Not Started`, `In Progress`, `Blocked`, or `Completed`.
- A `Needs Decision` note identifies a documented open question or an implementation contract not yet specified. Resolve it before implementing the affected behavior; do not treat a proposed option as an approved requirement.
- Expected paths follow `04_ARCHITECTURE.md`. Add only files needed for the task; avoid creating empty template files. Test filenames below are suggested exact paths for new tests, not a requirement to use a particular test framework.
- All API tasks use `/api/v1` except the existing health route, unless the API contract is deliberately revised and documented.

## Documented decisions and contract gaps to keep visible

Resolve these at the task where they first affect behavior:

1. **Repair-state design:** `01_PHASE_1_REQUIREMENTS.md` lists `APPROVED` and `REJECTED` as repair states and also allows estimate response metadata. `AI_CONTEXT.md` cautions against storing the same fact in both places. Choose one consistent representation before defining the repair schema.
2. **Cancellation:** decide whether a customer may cancel after assignment but before an estimate, and define all eligible states. Admin cancellation/override and required audit behavior are also open.
3. **Rejected estimate:** decide whether rejection closes the request or permits a revised estimate.
4. **Field constraints:** exact permitted device values and maximum lengths for device fields and issue description are not specified.
5. **Technician provisioning:** decide whether an admin creates/activates technician accounts directly or uses invitations. There is no technician-management endpoint in the current API map.
6. **Tokens and sessions:** finalize access-token lifetime/signing configuration and refresh-token lifetime, rotation, reuse detection, logout scope, session invalidation, and concurrent-session policy before shipping auth/session behavior.
7. **API errors:** `02_PHASE_2_API_CONTRACT.md` shows `{ success: false, error: { code, message } }`; the current handler returns `{ error: { message } }`. Decide and document the canonical shape and the `400` versus `422` policy before feature endpoints depend on it.
8. **Validation and automated testing:** no validation library, test runner, or test strategy is selected in the docs. Select and document appropriate tools when implementing those tasks; do not assume a package is already installed.
9. **Pagination and deployment:** the API contract requires pagination before lists grow large but does not specify its request/response format. No deployment platform or operational configuration is selected.

## Phase 0 — Initial setup

### SETUP-01 — Establish the backend bootstrap

- **Objective:** Provide the smallest runnable Express backend and protect local environment values.
- **Prerequisites:** None.
- **Expected files:** `backend/package.json`, `backend/package-lock.json`, `backend/.gitignore`, `backend/.env`, `backend/.env.example`, `backend/src/app.js`, `backend/src/server.js`, `backend/src/middlewares/errorHandler.js`; directories `backend/src/config/`, `backend/src/modules/`, and `backend/tests/`.
- **Requirements:** Use the existing CommonJS/Express setup; keep app configuration separate from server startup; load dotenv; expose `GET /health`; parse JSON; return a consistent 404/error response; ignore `.env`, `.env.*`, and `node_modules/` while allowing `.env.example`; do not connect MongoDB at this stage.
- **Acceptance:** Required dependencies and `dev`/`start` scripts are present; server starts and stops; `/health` returns 200 JSON; an unknown route returns 404 JSON; `.env` and `node_modules` are ignored and `.env.example` is trackable; no real secret is tracked.
- **Manual/API tests:** Run `npm run dev`; request `/health` and an unknown path; stop the process; check ignore patterns in a Git worktree once one exists.
- **Automated tests:** None were present at initial setup; endpoint and middleware tests are added under TEST-01 and later tasks.
- **Status:** Completed.
- **Evidence:** Reported in `07_PROJECT_STATUS.md`; re-check files and behavior if the bootstrap changes.

## Phase 1 — Shared infrastructure and test foundation

### DB-01 — Finalize database connection configuration

- **Objective:** Specify the minimum environment contract needed to connect without committing credentials.
- **Prerequisites:** SETUP-01.
- **Expected files:** `backend/.env.example`; `backend/.env` for local-only values; `docs/03_PHASE_3_DATABASE_DESIGN.md` only if a lasting design decision needs recording.
- **Requirements:** Identify the MongoDB connection-string environment variable and its placeholder format; decide how missing/invalid configuration is reported at startup. Keep real credentials only in ignored local environment configuration. Do not choose a hosting or database provider here.
- **Acceptance:** The required variable and startup behavior are written down; `.env.example` contains placeholders only; no secret is added to tracked files.
- **Manual/API tests:** Inspect local and example environment files; confirm the configured local value is not a real credential.
- **Automated tests:** Add config validation tests with TEST-01 once the runner is selected.
- **Status:** Not Started.
- **Needs Decision:** Connection-string variable name and exact missing/invalid-variable startup behavior are not specified.

### DB-02 — Connect MongoDB before listening

- **Objective:** Make persistence availability a prerequisite for serving the API.
- **Prerequisites:** DB-01, SETUP-01, TEST-01.
- **Expected files:** `backend/src/config/database.js`, `backend/src/config/env.js`, `backend/src/server.js`, `backend/.env.example`; `backend/src/app.js` only if health behavior must distinguish application liveness from database readiness.
- **Requirements:** Use Mongoose; validate required environment configuration at startup; connect before opening the HTTP listener; surface connection/startup failures explicitly; close the database and HTTP server cleanly on shutdown. Do not add models or business operations in this task. Decide whether `/health` means process liveness or database readiness before changing its current meaning.
- **Acceptance:** With valid local configuration, MongoDB connects before the server listens; with absent/invalid configuration or an unavailable database, startup fails visibly and does not report a successful listener; shutdown closes resources.
- **Manual/API tests:** Start against a reachable development database; verify `/health`; repeat with missing configuration and an unreachable database; stop and confirm clean shutdown.
- **Automated tests:** Config tests and focused startup/connection tests; use an isolated test database or suitable connection mock, selected as part of TEST-01.
- **Status:** Not Started.
- **Needs Decision:** The meaning of health readiness is unspecified; retain liveness semantics unless the contract is explicitly updated.

### ERR-01 — Align centralized errors with the API contract

- **Objective:** Give all routes predictable errors without leaking stack traces or internal details.
- **Prerequisites:** SETUP-01, TEST-01.
- **Expected files:** `backend/src/middlewares/errorHandler.js`, `backend/src/app.js`; a shared error helper under `backend/src/` only if needed; `docs/02_PHASE_2_API_CONTRACT.md` if the canonical contract is clarified.
- **Requirements:** Preserve centralized error handling and middleware ordering; map known validation, authentication, authorization, missing-resource, conflict, and unexpected errors to documented HTTP statuses; never expose internal stack traces/secrets. Make all API errors conform to the decided response envelope.
- **Acceptance:** Not-found and representative client/server failures have the documented status and JSON shape; unexpected errors have no internal detail; errors after headers are sent are delegated rather than rewritten.
- **Manual/API tests:** Request a missing route and trigger malformed JSON; inspect status and body; verify an unexpected error does not return a stack trace.
- **Automated tests:** Unit tests for the handler's status mapping, response envelope, and headers-sent behavior.
- **Status:** Not Started.
- **Needs Decision:** Choose canonical error envelope and whether semantic validation uses 400 or 422. Current handler and illustrative API contract differ.

### VAL-01 — Add shared request validation

- **Objective:** Reject malformed or semantically invalid client input before business logic or database writes.
- **Prerequisites:** ERR-01, TEST-01.
- **Expected files:** `backend/src/middlewares/validate.js`; feature validation modules such as `backend/src/modules/auth/auth.validation.js` and `backend/src/modules/repairs/repair.validation.js` as those features are added.
- **Requirements:** Select a validation approach; make validation middleware share the standard error contract; validate request bodies and route parameters at the route boundary; do not silently coerce or accept protected fields.
- **Acceptance:** Invalid input is rejected before service/model calls; validation failures have the chosen status and error format; valid input reaches the handler unchanged except for explicitly documented normalization.
- **Manual/API tests:** Submit malformed and out-of-range payloads to each endpoint as it is implemented.
- **Automated tests:** Middleware unit tests and per-feature schema/route tests.
- **Status:** Not Started.
- **Needs Decision:** No validation package or schema format is selected; document the choice before adding a dependency.

### TEST-01 — Establish automated test conventions

- **Objective:** Let each small implementation task prove its behavior without relying only on manual checks.
- **Prerequisites:** SETUP-01.
- **Expected files:** `backend/package.json`, `backend/package-lock.json`, test setup/config files only if required, and focused files under `backend/tests/`.
- **Requirements:** Replace the placeholder `test` script with a selected test runner and a repeatable way to run unit/API tests; keep test configuration separate from production configuration; provide safe test database handling when database tests are added; never point tests at production data.
- **Acceptance:** A documented npm command runs the selected test suite and exits nonzero on failure; a representative test runs successfully; no real credentials are required for unit tests.
- **Manual/API tests:** Run the documented test command from `backend/`.
- **Automated tests:** Add an initial health/404 or error-handler test once the runner is selected.
- **Status:** Not Started.
- **Needs Decision:** Test runner and integration-test database strategy are unspecified.

## Phase 2 — Users and authentication

### USER-01 — Implement the user model

- **Objective:** Store user identity, role, activation state, and a password hash according to the database design.
- **Prerequisites:** DB-02, TEST-01.
- **Expected files:** `backend/src/modules/users/user.model.js`; `backend/src/modules/users/user.service.js` only if a shared user operation is required.
- **Requirements:** Implement documented fields, Mongoose timestamps, normalized email, unique email index, role enum, and active flag; never persist plaintext passwords; prevent ordinary response serialization from exposing `passwordHash`. Handle database uniqueness as authoritative.
- **Acceptance:** Schema enforces required fields and valid roles; email normalization and unique index are verified; serialized ordinary user data excludes password hash.
- **Manual/API tests:** Inspect a development record and attempt duplicate normalized emails.
- **Automated tests:** Model tests for validation, normalization, role constraints, serialization, and duplicate-key behavior.
- **Status:** Not Started.

### AUTH-01 — Register customers

- **Objective:** Provide public customer registration without allowing privilege escalation.
- **Prerequisites:** USER-01, VAL-01, ERR-01.
- **Expected files:** `backend/src/modules/auth/auth.routes.js`, `auth.controller.js`, `auth.service.js`, `auth.validation.js`; `backend/src/app.js` to mount `/api/v1/auth`.
- **Requirements:** Implement `POST /api/v1/auth/register`; validate required registration fields; normalize email; hash the password using an appropriate password-hashing algorithm; always set role to `customer`; ignore/reject client attempts to provide a privileged role or protected fields; translate duplicate email into a predictable conflict; return a safe user representation.
- **Acceptance:** Valid registration creates a customer with a password hash; response excludes password/hash; duplicate email conflicts; supplied `admin`/`technician` role cannot create privileged user.
- **Manual/API tests:** Register valid customer; repeat same normalized email; attempt role escalation; inspect database record and response.
- **Automated tests:** Service and API tests for valid registration, invalid inputs, duplicate race/error, safe output, and role escalation.
- **Status:** Not Started.

### AUTH-02 — Implement login and access-token issuance

- **Objective:** Verify customer/authorized account credentials and establish an authenticated request identity.
- **Prerequisites:** AUTH-01, USER-01, VAL-01, ERR-01.
- **Expected files:** `backend/src/modules/auth/auth.routes.js`, `auth.controller.js`, `auth.service.js`, `auth.validation.js`; `backend/src/config/env.js`; package files only if a selected token library is needed.
- **Requirements:** Implement `POST /api/v1/auth/login`; verify password against the stored hash; reject inactive accounts; return no password hash or secret; issue an access token usable by later auth middleware; handle credential failures without leaking whether an email exists.
- **Acceptance:** Valid credentials issue a token with the authenticated user's identity; wrong credentials and inactive accounts are rejected consistently; response contains no hash or internal secret.
- **Manual/API tests:** Register/login; try wrong password, unknown email, and inactive account; inspect response and token claims without exposing secrets.
- **Automated tests:** Login service/API tests for success, invalid credentials, inactive account, and safe response.
- **Status:** Not Started.
- **Needs Decision:** Access-token lifetime, signing algorithm/library, secret/key environment configuration, and claim contract are not specified.

### AUTH-03 — Authenticate requests and expose the current user

- **Objective:** Verify access tokens and support the documented current-user endpoint.
- **Prerequisites:** AUTH-02, ERR-01.
- **Expected files:** `backend/src/middlewares/authenticate.js`, `backend/src/modules/auth/auth.routes.js`, `auth.controller.js`, `auth.service.js`; `backend/src/config/env.js`.
- **Requirements:** Implement `GET /api/v1/auth/me`; authenticate using the agreed access-token contract; reject missing, invalid, or expired credentials with 401; load/confirm the principal as required by the selected account policy; return only safe profile fields.
- **Acceptance:** Valid token returns the matching safe user; missing, malformed, expired, or invalid token is rejected; a deactivated account cannot continue to access protected resources under the chosen policy.
- **Manual/API tests:** Call `/auth/me` with valid, absent, malformed, expired, and invalid tokens.
- **Automated tests:** Middleware and route tests for token verification and safe current-user output.
- **Status:** Not Started.

### AUTH-04 — Enforce role authorization

- **Objective:** Make customer, technician, and admin access rules enforceable on the backend.
- **Prerequisites:** AUTH-03.
- **Expected files:** `backend/src/middlewares/authorize.js`; route files for auth and repairs as they are implemented.
- **Requirements:** Implement reusable role checks; distinguish unauthenticated from authenticated-but-forbidden requests; enforce documented role permissions at protected route boundaries; do not rely on client-side checks.
- **Acceptance:** Each protected route rejects missing identity with 401 and disallowed roles with 403; allowed roles reach the handler.
- **Manual/API tests:** Exercise representative customer, technician, and admin requests against allowed and denied routes.
- **Automated tests:** Middleware unit tests and route permission-matrix tests.
- **Status:** Not Started.

### SESS-01 — Implement refresh-session persistence

- **Objective:** Store revocable refresh-session records without persisting raw refresh tokens.
- **Prerequisites:** DB-02, USER-01, TEST-01.
- **Expected files:** `backend/src/modules/sessions/session.model.js`; `backend/src/modules/sessions/session.service.js` only if needed by auth orchestration.
- **Requirements:** Implement documented `refreshsessions` fields, user reference, unique `tokenHash`, expiry and revocation timestamps; add the documented TTL cleanup index only alongside application-level expiry checks.
- **Acceptance:** Raw tokens are never stored; unique token hash and expiry data persist; expired/revoked sessions are rejected by the service even if cleanup has not run.
- **Manual/API tests:** Inspect stored session values and verify expiry/revocation behavior using a non-production database.
- **Automated tests:** Model/service tests for hashed token storage, uniqueness, expiry, revocation, and TTL index definition.
- **Status:** Not Started.
- **Needs Decision:** Refresh lifetime, rotation, reuse detection, session invalidation, and concurrent-session policy are unresolved.

### SESS-02 — Issue and rotate refresh sessions

- **Objective:** Implement the planned refresh endpoint using the approved refresh policy.
- **Prerequisites:** AUTH-02, AUTH-03, SESS-01.
- **Expected files:** `backend/src/modules/auth/auth.routes.js`, `auth.controller.js`, `auth.service.js`; session model/service files.
- **Requirements:** Implement `POST /api/v1/auth/refresh`; accept only valid refresh credentials; compare hashes safely; enforce expiry/revocation; issue access credentials and rotate/revoke refresh credentials according to the finalized policy; handle reuse according to the decision.
- **Acceptance:** Valid refresh yields the contract-defined response and session state; expired, revoked, malformed, or reused credentials are rejected; raw refresh tokens are not persisted or logged.
- **Manual/API tests:** Refresh once; reuse old token; try expired/revoked token; test concurrent requests according to selected policy.
- **Automated tests:** Service/API tests for valid refresh, expiry, revocation, rotation, and reuse/concurrency policy.
- **Status:** Not Started.
- **Needs Decision:** Blocked on SESS-01's refresh-policy decisions.

### SESS-03 — Revoke sessions on logout

- **Objective:** Implement the documented logout endpoint and chosen revocation scope.
- **Prerequisites:** AUTH-03, SESS-01, SESS-02.
- **Expected files:** `backend/src/modules/auth/auth.routes.js`, `auth.controller.js`, `auth.service.js`, session service/model.
- **Requirements:** Implement `POST /api/v1/auth/logout`; require authenticated identity; revoke the applicable refresh session(s) only within the approved logout policy; do not accept another user's session identifier as authority.
- **Acceptance:** Correct session is revoked; subsequent refresh fails; another user's session cannot be revoked; repeated logout behavior follows the documented policy.
- **Manual/API tests:** Logout and attempt refresh; attempt cross-user/session revocation; repeat logout.
- **Automated tests:** API/service tests for revocation scope, authorization, and repeat behavior.
- **Status:** Not Started.
- **Needs Decision:** Logout scope and all-session invalidation behavior are unresolved.

## Phase 3 — Repair model and read/create APIs

### REP-01 — Finalize repair and estimate state design

- **Objective:** Turn the proposed lifecycle into one unambiguous, service-enforceable state model.
- **Prerequisites:** None; resolve before REP-02 and repair transition endpoints.
- **Expected files:** `docs/01_PHASE_1_REQUIREMENTS.md`, `docs/02_PHASE_2_API_CONTRACT.md`, `docs/03_PHASE_3_DATABASE_DESIGN.md`, and `docs/AI_CONTEXT.md` where their statements must be kept consistent.
- **Requirements:** Decide whether approval/rejection is represented in repair status, estimate response metadata, or both as distinct facts; enumerate allowed transitions; finalize cancellation eligibility, admin override/audit policy, and rejected-estimate/revision policy. Preserve documented lifecycle and avoid arbitrary client-controlled status.
- **Acceptance:** The four documents agree on the states, allowed transitions, estimate response semantics, cancellation policy, and whether rejection/revision is possible; no transition is implied but undocumented.
- **Manual/API tests:** Review the transition table against every actor action in the API contract; no runtime test applies until implemented.
- **Automated tests:** REP-02/transition tests implement the approved transition table.
- **Status:** Not Started.
- **Needs Decision:** The state duplication, cancellation, admin override, and rejection/revision questions listed in the source docs remain open.

### REP-02 — Implement repair persistence and transition primitives

- **Objective:** Persist repairs and their state history without allowing arbitrary state changes.
- **Prerequisites:** DB-02, REP-01, VAL-01.
- **Expected files:** `backend/src/modules/repairs/repair.model.js`, `repair.service.js`.
- **Requirements:** Implement documented customer/technician references, device details, status, estimate, status history, and timestamps; keep history embedded for MVP; add only query-driven indexes from DB design; validate referenced entities in application logic; provide service-level allowed-transition operations that update current state and history consistently (atomic update or transaction as appropriate).
- **Acceptance:** Invalid states/transitions cannot be persisted through service operations; history matches state changes; references and schema validation work; indexes match documented query use cases.
- **Manual/API tests:** Use a development database to inspect a valid repair and history; try invalid enum values, invalid references, and illegal transitions through the service.
- **Automated tests:** Model and service tests for schema constraints, transitions, history consistency, and persistence errors.
- **Status:** Not Started.
- **Needs Decision:** Device allowed values and exact field maximum lengths must be finalized before schema validation.

### REP-03 — Create customer repair requests

- **Objective:** Allow an authenticated customer to submit a repair request.
- **Prerequisites:** AUTH-03, AUTH-04, REP-02, VAL-01.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`, `repair.validation.js`; `backend/src/app.js` to mount `/api/v1/repairs`.
- **Requirements:** Implement `POST /api/v1/repairs`; derive customer ID from authenticated principal; set initial status server-side; accept only documented device details; reject or ignore protected `customerId`, `technicianId`, and `status`; return the documented safe response shape.
- **Acceptance:** Valid customer request is stored with the caller as customer and `REQUESTED` status; client cannot assign another customer, technician, or status; invalid device fields fail validation.
- **Manual/API tests:** Create request; try protected fields and invalid/missing device fields; verify persisted owner/status.
- **Automated tests:** API/service tests for successful create, validation, ownership derivation, and protected-field injection.
- **Status:** Not Started.

### REP-04 — List and read role-scoped repair requests

- **Objective:** Expose only repairs visible to the authenticated caller.
- **Prerequisites:** REP-03, AUTH-03, AUTH-04.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`, `repair.validation.js`.
- **Requirements:** Implement `GET /api/v1/repairs` and `GET /api/v1/repairs/:id`; apply customer, assigned-technician, and admin query scopes in the service/database query; do not fetch all records and filter in the client; use a consistent policy for hidden resources; add pagination before the list is used for growing data.
- **Acceptance:** Customers see only their own repairs; technicians see only assigned repairs; admins see the authorized set; direct lookup enforces the same access rules; responses exclude internal secrets.
- **Manual/API tests:** Create records for multiple users/roles and compare list and detail results, including unauthorized IDs.
- **Automated tests:** API/service tests for each role scope, hidden/not-found behavior, pagination bounds once defined, and safe serialization.
- **Status:** Not Started.
- **Needs Decision:** Pagination request/response format and exact not-found-versus-forbidden policy for protected resources must be specified consistently with the API contract.

## Phase 4 — Assignment and repair lifecycle

### TECH-01 — Define authorized technician provisioning

- **Objective:** Ensure assignment can select only an eligible technician account without inventing an account-creation feature.
- **Prerequisites:** USER-01, AUTH-04.
- **Expected files:** `docs/01_PHASE_1_REQUIREMENTS.md`, `docs/02_PHASE_2_API_CONTRACT.md`; implementation paths only if the selected authorized process adds an API.
- **Requirements:** Decide how an admin creates or activates technician users and document the permissions and lifecycle. Keep public registration customer-only. Do not expose arbitrary public role assignment.
- **Acceptance:** Technician account provisioning is explicitly defined, protected, and consistent with customer-only registration; assignment prerequisites can be tested.
- **Manual/API tests:** Verify the approved provisioning path cannot be used by a customer/technician; runtime checks follow the chosen process.
- **Automated tests:** Tests for the selected provisioning process and role restrictions.
- **Status:** Not Started.
- **Needs Decision:** Admin-created/activated accounts versus invitations is unresolved; no technician-management endpoint is currently documented.

### REP-05 — Assign a technician

- **Objective:** Let an authorized admin manually assign an eligible technician to a repair.
- **Prerequisites:** REP-02, REP-04, TECH-01, AUTH-04.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`, `repair.validation.js`.
- **Requirements:** Implement `POST /api/v1/repairs/:id/assign`; only admin may call it; verify target exists, is active, and has technician role; permit the operation only from an approved state; set technician and status through the transition service and record status history.
- **Acceptance:** Valid admin assignment stores the technician and expected state/history; customer and technician callers are denied; inactive, wrong-role, missing technician, and illegal-state assignments fail predictably.
- **Manual/API tests:** Assign valid and invalid technician accounts; try with each role and against an ineligible repair state.
- **Automated tests:** Route/service tests for authorization, technician validation, state transition, and history.
- **Status:** Not Started.

### REP-06 — Submit or revise a technician estimate

- **Objective:** Allow the assigned technician to provide the repair estimate.
- **Prerequisites:** REP-02, REP-05, VAL-01, AUTH-04.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`, `repair.validation.js`.
- **Requirements:** Implement `POST /api/v1/repairs/:id/estimate`; require assigned technician; validate amount, INR currency, and notes according to finalized bounds; perform only an allowed transition; do not accept client-provided response status or repair status.
- **Acceptance:** Assigned technician can submit a valid estimate and move repair to the agreed pending state; unassigned/other technician and customer cannot submit; invalid amount/currency/state is rejected.
- **Manual/API tests:** Submit valid estimate; test wrong technician, invalid values, and duplicate/revision attempt.
- **Automated tests:** API/service tests for authorization, amount/notes validation, state transition, and revision policy.
- **Status:** Not Started.
- **Needs Decision:** Whether rejected estimates allow revision and any field bounds not specified in the docs.

### REP-07 — Approve or reject an estimate

- **Objective:** Let only the owning customer respond to the pending estimate.
- **Prerequisites:** REP-01, REP-02, REP-06, REP-04, AUTH-04.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`, `repair.validation.js`.
- **Requirements:** Implement `POST /api/v1/repairs/:id/estimate-response`; accept only the contract-defined approve/reject choice; enforce owner and pending-state checks; update the approved state/response metadata consistently with REP-01; never accept arbitrary status.
- **Acceptance:** Owning customer can respond once in the eligible state; other customers, technicians, admins unless explicitly allowed, duplicate responses, and invalid choices are rejected; state/history/estimate metadata remain consistent.
- **Manual/API tests:** Approve and reject separate requests; test non-owner, wrong role, duplicate response, and response before estimate.
- **Automated tests:** API/service tests for ownership, response validation, allowed transition, duplicate/conflict handling, and history.
- **Status:** Not Started.

### REP-08 — Cancel eligible customer requests

- **Objective:** Allow an owning customer to cancel only in approved pre-work states.
- **Prerequisites:** REP-01, REP-02, REP-04, AUTH-04.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`.
- **Requirements:** Implement `POST /api/v1/repairs/:id/cancel`; enforce ownership and the final cancellation policy; reject cancellation after work starts and all other ineligible states; record the state change in history. Do not implement admin cancellation unless explicitly decided.
- **Acceptance:** Cancellation succeeds only for documented eligible states and owner; in-progress/completed and other disallowed states cannot be cancelled; state/history stay consistent.
- **Manual/API tests:** Cancel in each eligible state and attempt cancellation in each ineligible state as owner and non-owner.
- **Automated tests:** Transition matrix, ownership, and cancellation audit/history tests.
- **Status:** Not Started.
- **Needs Decision:** Eligibility after assignment and admin cancellation/override/audit behavior remain unresolved.

### REP-09 — Start approved repairs

- **Objective:** Let the assigned technician begin work only after approval.
- **Prerequisites:** REP-02, REP-05, REP-07, AUTH-04.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`.
- **Requirements:** Implement `POST /api/v1/repairs/:id/start`; require the assigned technician; allow only the finalized approved state to transition to `IN_PROGRESS`; record history; never permit direct request-to-completed or client-selected status.
- **Acceptance:** Assigned technician starts an approved repair; other roles/technicians and unapproved or terminal states are rejected; history records the transition.
- **Manual/API tests:** Start approved repair; try unapproved, rejected, cancelled, completed, and differently assigned repairs.
- **Automated tests:** API/service transition and authorization matrix tests.
- **Status:** Not Started.

### REP-10 — Complete repairs

- **Objective:** Let the assigned technician mark work complete after it has started.
- **Prerequisites:** REP-02, REP-09, AUTH-04.
- **Expected files:** `backend/src/modules/repairs/repair.routes.js`, `repair.controller.js`, `repair.service.js`.
- **Requirements:** Implement `POST /api/v1/repairs/:id/complete`; require assigned technician; allow only `IN_PROGRESS` to `COMPLETED`; record status history; do not add unrequested payment, notification, or delivery behavior.
- **Acceptance:** Only the assigned technician completes an in-progress repair; every other role/assignment/state fails; completion is persisted once with matching history.
- **Manual/API tests:** Complete in-progress repair; try before start, repeat completion, and use another technician.
- **Automated tests:** API/service tests for transition, authorization, idempotency/conflict policy, and history.
- **Status:** Not Started.

## Phase 5 — Security, documentation, and deployment

### SEC-01 — Review and harden the implemented API

- **Objective:** Verify documented security rules across all implemented endpoints before deployment.
- **Prerequisites:** AUTH-01–AUTH-04, SESS-01–SESS-03, REP-01–REP-10, TECH-01, ERR-01, VAL-01.
- **Expected files:** Relevant auth/repair middleware, services, schemas, and tests; `docs/AI_CONTEXT.md` or security documentation only if approved behavior needs recording.
- **Requirements:** Check customer-only public registration; password hashing; hashed refresh tokens; backend role/ownership enforcement; protected-field rejection; input and transition validation; non-disclosure of hashes, secrets, stack traces; session expiry/revocation; database query scoping; and current dependency audit findings. Do not add rate limiting or other infrastructure unless a documented need is accepted.
- **Acceptance:** Each documented security rule has a corresponding passing test or an explicitly justified, documented exclusion; no response/log path exposes secrets or password hashes; cross-user access tests fail safely; `npm audit` has been reviewed and any remaining findings have an explicit disposition.
- **Manual/API tests:** Run an auth/role/ownership abuse checklist against local data; inspect responses and logs for sensitive values.
- **Automated tests:** Security regression tests for role escalation, ownership/assignment bypass, protected fields, token/session misuse, and error leakage.
- **Status:** Not Started.

### TEST-02 — Complete endpoint and lifecycle test coverage

- **Objective:** Verify the API's documented success and failure behavior end to end.
- **Prerequisites:** TEST-01, AUTH-01–AUTH-04, SESS-01–SESS-03, REP-01–REP-10, TECH-01, ERR-01, VAL-01.
- **Expected files:** Focused files under `backend/tests/` (for example auth, sessions, repairs, and middleware suites); `backend/package.json` if scripts need refinement.
- **Requirements:** Test authentication and authorization, validation, ownership/scoping, duplicate and conflicting operations, every approved repair transition, and consistent errors. Use isolated test data and clean it up; do not contact production services.
- **Acceptance:** A single documented command runs the relevant automated suite; tests cover each actor and positive/negative path; all tests pass in a clean local setup.
- **Manual/API tests:** Execute the API contract flow in Postman: register/login, create/list/read, assign, estimate, respond, start/complete, and eligible cancellation.
- **Automated tests:** Unit, integration, and API tests selected in TEST-01; verify no skipped critical authorization/state-transition tests.
- **Status:** Not Started.

### DOC-01 — Publish the API contract and usage instructions

- **Objective:** Make implemented endpoints usable without contradicting code or approved business rules.
- **Prerequisites:** AUTH-01 through SESS-03 and REP-03 through REP-10; all relevant decisions resolved.
- **Expected files:** `docs/02_PHASE_2_API_CONTRACT.md`, `docs/README.md`; add an API reference or Postman collection only if the project chooses that deliverable.
- **Requirements:** Document actual method/path, authentication, roles, request/response schemas, status codes, error envelope, state constraints, pagination, and representative failure cases; clearly distinguish implemented behavior from future plans.
- **Acceptance:** Every implemented route is documented and examples match actual responses; no unresolved behavior is presented as settled; docs can be followed to test the workflow.
- **Manual/API tests:** Follow the documented sequence using Postman or another API client against local development.
- **Automated tests:** Contract/schema checks only if selected; at minimum ensure documented examples are checked against API responses during review.
- **Status:** Not Started.
- **Needs Decision:** Pagination shape, API error shape/status policy, and whether a Postman collection is desired are not fully specified.

### DEPLOY-01 — Select and document a deployment target

- **Objective:** Resolve deployment-specific constraints before adding platform configuration.
- **Prerequisites:** DOC-01; SEC-01.
- **Expected files:** `docs/00_PROJECT_OVERVIEW.md` or `docs/07_PROJECT_STATUS.md` for the decision; platform-specific files only after selection.
- **Requirements:** Select a single deployment target and document required runtime, environment variables, database connectivity, and start command. Keep the architecture a single deployable backend; do not add infrastructure without demonstrated need.
- **Acceptance:** Target and required configuration are approved and documented; no credentials are committed; deployment steps can be expressed without guessing.
- **Manual/API tests:** Review target compatibility with Node runtime and backend start command.
- **Automated tests:** None for the decision itself.
- **Status:** Not Started.
- **Needs Decision:** Hosting provider/platform and environment provisioning approach are unspecified.

### DEPLOY-02 — Configure and verify deployment

- **Objective:** Deploy the backend to the selected target and demonstrate its operation without claiming readiness from a successful build alone.
- **Prerequisites:** DEPLOY-01, DB-02, SEC-01, TEST-02, DOC-01.
- **Expected files:** Only target-required configuration/workflow files in `backend/` or repository root, plus deployment instructions in `docs/`.
- **Requirements:** Configure the selected runtime/start command and secret environment values; connect only to the intended database; provide health verification and review startup/shutdown logs; keep credentials out of source and build artifacts.
- **Acceptance:** Deployment starts on the selected platform; health check and a safe API smoke test succeed; expected failure behavior is visible; automated tests pass before deployment; no secret is present in tracked files or logs.
- **Manual/API tests:** Verify deployed health endpoint and documented safe API flow; verify invalid configuration fails visibly without exposing values.
- **Automated tests:** Run TEST-02 suite before deployment; add a deployment smoke test only if supported by the chosen platform.
- **Status:** Not Started.

## How to Use This Checklist

1. Select a `Not Started` task whose prerequisite IDs are all `Completed`; resolve any `Needs Decision` item before coding behavior that depends on it.
2. Read the linked source documents and inspect the current files. Attempt the small task yourself first, then use AI for focused analysis or implementation help as described in `05_AI_ASSISTED_WORKFLOW.md`.
3. Review every changed file and confirm the implementation follows its stated requirements without unrelated changes.
4. Run the task's manual/API checks and relevant automated tests. Report actual results; do not mark work complete based on code existing or documentation alone.
5. Update this task's status only after acceptance criteria pass. Record blockers and newly discovered decisions explicitly, then choose the next dependency-ready task.
