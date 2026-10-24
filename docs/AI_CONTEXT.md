# FixFlow — AI Coding Context

Read this file before working on the project. Also read the phase-specific document named in the task.

## Project
FixFlow is a small but realistic electronics repair management REST API. Customers create repair requests; an admin assigns a technician; the technician submits an estimate; the customer approves/rejects it; the technician performs and completes the repair.

## Stack and architecture
- Node.js, Express, MongoDB, Mongoose
- Feature-based modular monolith
- Shared middleware and configuration
- API base path: `/api/v1`
- Initial API testing with Postman
- Do not add microservices or unnecessary infrastructure.

## Core modules
- Auth: register/login/logout/refresh/current user
- Users: account data and roles
- Repairs: requests, assignments, estimates, lifecycle
- Sessions: hashed refresh tokens and revocation

## Core security rules
- Public registration creates customer role only.
- Never store plaintext passwords or refresh tokens.
- Never trust client-provided `customerId`, protected role, assignment or arbitrary status.
- Enforce authentication, role permissions and resource ownership on the backend.
- Validate input and repair-state transitions server-side.
- Never expose secrets, password hashes or internal stack traces.
- If secrets were committed, rotate them; deleting `.env` alone is insufficient.

## Planned data collections
- `users`: name, normalized unique email, passwordHash, role, isActive, timestamps
- `repairrequests`: customerId, optional technicianId, device details, status, estimate, statusHistory, timestamps
- `refreshsessions`: userId, tokenHash, expiresAt, revokedAt, createdAt

These are plans, not proof of implementation. Read `03_PHASE_3_DATABASE_DESIGN.md` for details and unresolved decisions.

## Planned repair workflow
REQUESTED → ASSIGNED → ESTIMATE_PENDING → customer approves/rejects → APPROVED or REJECTED → IN_PROGRESS → COMPLETED.
Cancellation is allowed only in eligible pre-work states. The final state model must avoid duplicating the same fact in repair status and estimate response fields.

## Architecture responsibilities
- Routes map endpoints to middleware/controllers.
- Controllers handle HTTP request/response.
- Services implement business rules and orchestration.
- Models handle Mongoose schemas and persistence.
- Middleware handles shared concerns such as authentication, authorization, validation and errors.
- `app.js` configures the Express app.
- `server.js` loads configuration, connects required infrastructure and starts listening.

## AI working rules
1. Inspect the existing repository before edits.
2. For unclear tasks, analyze and propose a short plan before coding.
3. Work on one small task at a time.
4. Do not invent requirements or rewrite unrelated files.
5. Explain changed files and key decisions.
6. Run relevant tests/checks and report actual results; never fabricate test success.
7. Do not claim production readiness without evidence.
8. The learner must understand and verify the code.

## Current status
Initial backend setup has been implemented and verified. MongoDB connection and feature implementation remain pending. See `07_PROJECT_STATUS.md`.
