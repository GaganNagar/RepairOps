# Phase 3 — Database Design

Database: MongoDB with Mongoose.

The following is a proposed design. Schemas and indexes are not yet implemented.

## Collection 1: `users`

Proposed fields:
- `name`: required string, trimmed
- `email`: required normalized string, unique index
- `passwordHash`: required string; never included in ordinary API responses
- `role`: enum `customer`, `technician`, `admin`
- `isActive`: boolean, default true
- `createdAt`, `updatedAt`: timestamps

Security:
- Public registration must always create `customer`.
- Privileged role changes must use a controlled admin process.
- Use a database unique index for email; application-level pre-check alone is not enough to prevent races.
- Handle duplicate-key errors as a predictable conflict response.

## Collection 2: `repairrequests`

Proposed fields:
- `customerId`: required ObjectId reference to User
- `technicianId`: optional ObjectId reference to User until assigned
- `deviceType`: validated string enum
- `brand`: required trimmed string
- `model`: required trimmed string
- `issueDescription`: required string with a defined maximum length
- `status`: backend-controlled enum
- `estimate`: embedded subdocument containing amount, currency, notes and response metadata as finalized by the contract
- `statusHistory`: embedded array of status-change records
- `createdAt`, `updatedAt`: timestamps

Rules:
- Verify referenced technician exists, is active and has the technician role before assignment.
- Do not trust a client-provided customer ID.
- Validate all state transitions in the service layer.
- Consider atomic updates or transactions so current status and history do not diverge.
- Keep history embedded for the MVP; evaluate a separate collection if event volume or independent querying later justifies it.

## Collection 3: `refreshsessions`

Proposed fields:
- `userId`: required ObjectId reference to User
- `tokenHash`: required unique value
- `expiresAt`: required date
- `revokedAt`: optional date
- `createdAt`: date

Rules:
- Store a hash of the refresh token rather than the raw token.
- Verify expiry in application logic. A MongoDB TTL index is cleanup, not an exact-time authorization mechanism.
- Finalize refresh-token rotation, reuse detection, logout scope and concurrent-session policy before implementation.

## Relationships

- One user can create many repair requests.
- A repair request references one customer and optionally one assigned technician.
- One user can have multiple refresh sessions.
- Mongoose `ref` does not create a database-enforced foreign key. Validate referenced records and their roles in application logic.

## Index candidates

Choose indexes based on actual query patterns and verify with query plans:
- Unique index on `users.email`
- `{ customerId: 1, createdAt: -1 }` for customer request history
- `{ technicianId: 1, status: 1, createdAt: -1 }` for assigned work queues
- `{ status: 1, createdAt: -1 }` for admin lists, if used frequently
- Unique index on `refreshsessions.tokenHash`
- TTL index on `refreshsessions.expiresAt` for cleanup, alongside application expiry checks

Indexes improve relevant reads but increase storage and write costs. Do not add indexes without a query use case.
