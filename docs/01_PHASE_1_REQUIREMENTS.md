# Phase 1 — Requirements and Business Rules

## Actors

### Customer
- Register and log in.
- Create repair requests.
- View only their own repair requests.
- View details for their own requests.
- Approve or reject an estimate for their own request.
- Cancel their own request only while cancellation is allowed by the workflow.

### Technician
- A technician account is created or activated through an authorized admin process.
- View requests assigned to that technician only.
- Submit an estimate for an assigned repair.
- Start and complete an assigned repair only when the workflow allows it.

### Admin
- Manage technician accounts through an authorized process.
- View relevant repair requests.
- Assign a technician to a repair request.
- Perform only explicitly authorized administrative actions.

## Security rules

- Public registration must create a `customer` role only. A request body must not let a public user set `admin` or `technician`.
- Passwords must never be stored in plaintext; use bcrypt or another appropriate password-hashing algorithm.
- Do not expose password hashes or secrets in API responses.
- Customers must not read or change another customer's repair requests.
- Technicians must not access repairs assigned to other technicians.
- Enforce authorization on the backend, not only in the frontend.
- Validate user-supplied data before it reaches business logic or database writes.
- Secrets must not be committed to Git. If a secret has already been pushed, rotate it; deleting the file alone does not remove it from Git history.
- State transitions must be validated server-side.

## Initial business decisions

- Technician assignment: manual assignment by admin for the MVP.
- Currency: INR.
- Estimate: technician submits an estimate; customer approves or rejects it before work starts.
- Cancellation: customer can cancel before repair work starts, subject to defined status rules.
- Architecture: modular monolith.
- Database: MongoDB with Mongoose.
- Public registration: customers only.

## Planned repair lifecycle

The lifecycle must be implemented as explicit allowed transitions, not as arbitrary client-provided status values.

Proposed states:
- `REQUESTED`
- `ASSIGNED`
- `ESTIMATE_PENDING`
- `APPROVED`
- `REJECTED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Important: `APPROVED` is a repair workflow state in this initial draft. Estimate response may also be modeled separately as `pending`, `approved`, or `rejected`. Before implementation, choose one consistent state model to avoid duplicating the same fact across two fields. A recommended refinement is to keep repair status and estimate response distinct only if they represent genuinely different business facts.

Expected high-level transitions:
- `REQUESTED` → `ASSIGNED` (admin assigns technician)
- `ASSIGNED` → `ESTIMATE_PENDING` (assigned technician submits estimate)
- `ESTIMATE_PENDING` → `APPROVED` or `REJECTED` (customer responds)
- `APPROVED` → `IN_PROGRESS` (assigned technician starts work)
- `IN_PROGRESS` → `COMPLETED` (assigned technician completes work)
- Eligible pre-work states → `CANCELLED` (customer cancels, according to final policy)

No direct `REQUESTED` → `COMPLETED` transition.

## Open decisions to resolve during detailed design

- Whether customers can cancel after assignment but before an estimate is submitted.
- Whether admin can cancel or override a repair, and how that action is audited.
- Whether a rejected estimate closes the request permanently or allows a revised estimate.
- Exact maximum lengths and allowed values for device fields and issue description.
- Exact token lifetime, refresh-token rotation policy and session invalidation behaviour.
- Whether technician accounts are created manually by an admin or via invitations.
