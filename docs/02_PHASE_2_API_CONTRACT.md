# Phase 2 — API Contract (Planned)

Base path: `/api/v1`

These are planned endpoints, not implemented endpoints. Review and refine their contracts before coding.

## Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a customer |
| POST | `/auth/login` | Public | Verify credentials and establish a session |
| POST | `/auth/refresh` | Valid refresh session | Issue a new access token according to refresh policy |
| POST | `/auth/logout` | Authenticated | Revoke the relevant session/refresh token |
| GET | `/auth/me` | Authenticated | Return the current user's safe profile |

## Repair requests

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/repairs` | Customer | Create a repair request |
| GET | `/repairs` | Authenticated; result scoped by role | List requests visible to current user |
| GET | `/repairs/:id` | Authorized user | Read one request if access is allowed |
| POST | `/repairs/:id/assign` | Admin | Assign a technician |
| POST | `/repairs/:id/estimate` | Assigned technician | Submit or revise an estimate according to policy |
| POST | `/repairs/:id/estimate-response` | Owning customer | Approve/reject estimate |
| POST | `/repairs/:id/start` | Assigned technician | Start repair after approval |
| POST | `/repairs/:id/complete` | Assigned technician | Mark repair complete |
| POST | `/repairs/:id/cancel` | Owning customer; eligible state only | Cancel an eligible repair |

## API contract rules

- Use HTTP methods consistently and document request bodies, responses, permissions and failure cases.
- The client must not choose protected fields such as `customerId`, `technicianId` during creation, or arbitrary `status`.
- Derive the customer identity from the authenticated principal.
- Enforce list scoping in the database query or service layer; do not fetch all records and rely on frontend filtering.
- Use validation schemas for incoming data.
- Avoid leaking whether a protected resource exists if the security policy requires a uniform `404`.
- Add pagination to list endpoints before large result sets become a problem.

## Example: create repair request

Request:
```http
POST /api/v1/repairs
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "deviceType": "laptop",
  "brand": "Lenovo",
  "model": "IdeaPad Slim 5",
  "issueDescription": "Laptop overheating and shutting down"
}
```

The server derives the customer from the authenticated user and sets the initial status. The client cannot supply `customerId`, `technicianId`, or `status`.

Illustrative success response:
```json
{
  "success": true,
  "data": {
    "id": "<generated-id>",
    "deviceType": "laptop",
    "brand": "Lenovo",
    "status": "REQUESTED"
  }
}
```

## Consistent error shape

Illustrative response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REPAIR_STATE",
    "message": "Repair cannot be started before estimate approval."
  }
}
```

Choose and document a consistent policy for `400` versus `422`; do not use them interchangeably without a reason.

Suggested status codes:
- `400`: malformed request or invalid request syntax
- `401`: missing, invalid or expired access token
- `403`: authenticated but not permitted
- `404`: resource absent or intentionally hidden by access policy
- `409`: conflicting state transition or duplicate/conflicting operation
- `422`: syntactically valid input that fails a chosen semantic validation policy
- `429`: rate limit exceeded
- `500`: unexpected server error, with no internal details exposed to clients
