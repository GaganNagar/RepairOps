# RepairOps — Repair Management System

RepairOps is a modular backend REST API for an electronics repair management system. It provides a structured platform for managing device repair requests (such as laptops, desktops, mobiles, and tablets) through a defined operational lifecycle involving customers, technicians, and administrators.

The application is built as a feature-based modular monolith using Node.js, Express, and MongoDB with Mongoose. It currently implements JWT authentication, customer authorization for repair creation and listing, input validation on authentication and repair creation, and the initial repair-request workflow. Other repair lifecycle actions remain incomplete.

---

## Key Features

### Authentication & Session Management
- **Customer Registration & Login**: Validated registration with password hashing and email normalization.
- **Dual-Token Authentication**: Issues short-lived JWT access tokens (15 minutes) and long-lived refresh tokens (7 days).
- **Secure Refresh Token Rotation**: Stores refresh tokens as SHA-256 hashes in MongoDB sessions to prevent token theft.
- **HttpOnly Cookie Handling**: Sends refresh tokens via secure, httpOnly cookies with strict SameSite policy.
- **Session Revocation & Logout**: Database-backed session invalidation and cookie clearing upon logout.
- **User Profile Retrieval**: Authenticated profile endpoint returning the current user's name, email, and role.

### Repair Management
- **Repair Request Creation**: Authenticated customers can submit repair requests with validated device type, brand, model, and issue description.
- **Strict Input Whitelisting**: Request bodies for repair creation only permit designated fields, rejecting unexpected attributes.
- **Domain-Specific Schema**: Defines lifecycle statuses (`REQUESTED`, `ASSIGNED`, `ESTIMATE_PENDING`, `APPROVED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), cost estimates, and status-history records. Only initial request creation is currently implemented; lifecycle updates are not.
- **Lifecycle Route Architecture**: Pre-defined endpoints for technician assignment, estimate submission, customer estimate approval/rejection, repair execution, completion, and cancellation.

---

## User Roles & Permissions

The system defines three user roles in its user model (`customer`, `technician`, `admin`):

| Role | Implemented Capabilities | Planned / Route Stub Capabilities |
|---|---|---|
| `GET` | `/api/auth/get-me` | Bearer access token | Fetches current user profile (`name`, `email`, `role`) | Implemented |
| **Technician** | • Log in and authenticate<br>• Access profile | • View assigned repair requests<br>• Submit cost estimates<br>• Transition repairs to `IN_PROGRESS`<br>• Mark repairs as `COMPLETED` |
| **Admin** | • Log in and authenticate<br>• Access profile | • View all repair requests across the system<br>• Assign qualified technicians to repair requests |

> **Note on Role Assignment:** Public registration strictly forces the `customer` role. Admin and technician roles cannot be selected or escalated via registration payloads.

---

## Tech Stack

### Backend
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5.x
- **Configuration**: dotenv

### Database & Modeling
- **Database**: MongoDB
- **Object Data Modeling (ODM)**: Mongoose 9.x

### Authentication & Security
- **Access Tokens**: JSON Web Tokens (`jsonwebtoken`)
- **Refresh Token Storage**: SHA-256 cryptographic hashing (`crypto`) in MongoDB session store
- **Password Hashing**: bcrypt (10 salt rounds)
- **Cookie Parsing**: cookie-parser

### Development Tools
- **Process Monitoring**: nodemon
- **API Testing**: Postman / REST Client

---

## Application Workflow

The intended repair management lifecycle is modeled through discrete operational stages. Currently, only customer request creation is implemented; subsequent actions are planned:

```
[Customer] Submits Request (REQUESTED)
              │
              ▼
  [Admin] Assigns Technician (ASSIGNED)
              │
              ▼
[Technician] Submits Estimate (ESTIMATE_PENDING)
              │
      ┌───────┴───────┐
      ▼               ▼
[Customer] Approves  [Customer] Rejects
   (APPROVED)          (REJECTED)
      │
      ▼
[Technician] Starts Work (IN_PROGRESS)
      │
      ▼
[Technician] Completes Work (COMPLETED)
```

### Lifecycle States
1. **REQUESTED**: The customer submits a repair ticket specifying the device and problem description (*Implemented*).
2. **ASSIGNED**: An administrator assigns an active technician to assess the device (*Handler stub; authorization not wired*).
3. **ESTIMATE_PENDING**: The technician submits a formal repair cost estimate (*Handler stub; authorization not wired*).
4. **APPROVED / REJECTED**: The customer accepts or rejects the cost estimate (*Handler stub; authorization not wired*).
5. **IN_PROGRESS**: The assigned technician starts repair work after approval (*Handler stub; authorization not wired*).
6. **COMPLETED**: The technician finishes repair work (*Handler stub; authorization not wired*).
7. **CANCELLED**: The customer cancels the request during permitted pre-work stages (*Handler stub; authorization not wired*).

---

## Project Structure

```text
RepairOps/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB Mongoose connection handler
│   │   │   └── env.js               # Environment variable validation & exports
│   │   ├── middlewares/
│   │   │   ├── authenticate.js      # JWT verification & principal extraction
│   │   │   ├── authorize.js         # Role-based access control (customer check)
│   │   │   ├── errorHandler.js      # Centralized HTTP error response formatter
│   │   │   └── validate.js          # Shared validation middleware placeholder
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js  # Auth HTTP request & response handlers
│   │   │   │   ├── auth.routes.js      # Express route definitions for /api/auth
│   │   │   │   ├── auth.services.js    # Auth business logic & session operations
│   │   │   │   └── auth.validation.js  # Field validation for auth endpoints
│   │   │   ├── repairs/
│   │   │   │   ├── repair.controller.js  # Controller for repair actions
│   │   │   │   ├── repair.model.js       # Mongoose schemas for repairs & history
│   │   │   │   ├── repair.routes.js      # Express route definitions for /api/repairs
│   │   │   │   ├── repair.service.js     # Repair lifecycle database operations
│   │   │   │   └── repair.validations.js # Whitelist validator for repair creation
│   │   │   ├── sessions/
│   │   │   │   └── session.model.js      # Mongoose schema for refresh sessions
│   │   │   └── users/
│   │   │       ├── user.model.js         # Mongoose schema for user accounts & roles
│   │   │       └── user.service.js       # User service placeholder
│   │   └── app.js                   # Express application setup & middleware stack
│   ├── tests/                       # Automated test directory (pending setup)
│   ├── .env.example                 # Template for required environment variables
│   ├── .gitignore                   # Excludes node_modules and local .env files
│   ├── package.json                 # Project dependencies and npm scripts
│   ├── package-lock.json
│   └── server.js                    # Server entry point, DB bootstrap & shutdown
└── docs/                            # Project design and architecture documentation
    ├── 00_PROJECT_OVERVIEW.md
    ├── 01_PHASE_1_REQUIREMENTS.md
    ├── 02_PHASE_2_API_CONTRACT.md
    ├── 03_PHASE_3_DATABASE_DESIGN.md
    ├── 04_ARCHITECTURE.md
    ├── 05_AI_ASSISTED_WORKFLOW.md
    ├── 06_PHASE_4_SETUP_PLAN.md
    ├── 07_PROJECT_STATUS.md
    ├── AI_CONTEXT.md
    ├── IMPLEMENTATION_TASKS.md
    └── plan/
```

---

## Prerequisites

Before setting up RepairOps locally, ensure you have the following installed:

- **Node.js**: `v18.x` or higher (tested with CommonJS modules)
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a MongoDB Atlas connection URI

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/GaganNagar/RepairOps.git
cd RepairOps
```

### 2. Navigate to Backend Directory
```bash
cd Backend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a local `.env` file in the `Backend/` directory by copying the example template:
```bash
cp .env.example .env
```
Fill in the configuration parameters as described in the [Environment Variables](#environment-variables) section.

### 5. Start the Server

The current npm scripts refer to `src/server.js`, which does not exist. Until those scripts are corrected, run the root-level `server.js` directly:

#### For Development (with live-reload via nodemon):
```bash
npx nodemon server.js
```

#### For Production:
```bash
node server.js
```

The server currently listens on port `5000`. It logs connection status:
```text
FixFlow API listening on port 5000
connect to database successfully
```

---

## Environment Variables

The application requires specific environment variables for configuration and security validation at startup. If `MONGO_URI` or `JWT_SECRET` is missing, the server halts immediately.

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Read and validated by the server, but the current listener is hard-coded to port `5000` | `5000` |
| `MONGO_URI` | MongoDB connection string URI | `mongodb://localhost:27017/repair_ops` |
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens | `your_secure_random_jwt_secret` |

### Safe `.env.example` Template
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/repair_ops
JWT_SECRET=your_jwt_secret_key_here
```

## Data and Content to Exclude from GitHub PRs

Do not include real or sensitive data in a branch, commit, or pull request:

- **Secrets and credentials**: local `.env` files, MongoDB connection strings containing credentials, JWT/session secrets, API keys, passwords, private keys, access tokens, and refresh tokens. Keep `.env.example` limited to clearly fake placeholders.
- **Personal or customer information**: real names, email addresses, phone numbers, addresses, account details, or other identifying information.
- **Real repair records and database exports**: MongoDB dumps, backups, production/staging database exports, and repair tickets that contain customer or device-owner information.
- **Authentication material**: cookies, authorization headers, session data, and screenshots or logs that expose tokens or credentials.
- **Local or generated files**: `node_modules`, temporary files, local logs, and editor-specific files unless a project change specifically requires them.

Use synthetic, fictional values in API examples, tests, and screenshots. Share schemas, migrations, and sanitized sample data when they are needed to explain a change; verify that samples cannot identify a real person or expose a real device owner's information.

Before committing or opening a PR, review the working-tree changes and the complete branch diff against the PR's target branch:

```bash
git status --short
git diff HEAD
git diff <target-branch>...HEAD
```

The backend `.gitignore` excludes local `.env` files and `node_modules`, but still review every PR diff. If a secret was committed or pushed, removing it in a later commit is not enough: revoke or rotate it and notify the repository owner.

---

## API Overview

The API is mounted under `/api` (`/api/auth` and `/api/repairs`). A health check endpoint is provided at `/health`.

### System Health

| Method | Endpoint | Access | Purpose | Status |
|---|---|---|---|---|
| `GET` | `/health` | Public | Verify server availability (`{ "status": "ok" }`) | Implemented |

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description | Status |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new customer account, returns access token, sets refresh token cookie | Implemented |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns access token, sets refresh token cookie | Implemented |
| `GET` | `/api/auth/get-me` | Bearer access token | Fetches current user profile (`name`, `email`, `role`) | Implemented |
| `POST` | `/api/auth/refresh` | Cookie (`refreshToken`) | Rotates refresh token in DB and issues new access token | Implemented |
| `POST` | `/api/auth/logout` | Cookie (`refreshToken`) | Revokes refresh session in DB and clears cookie | Implemented |

#### Example: Register User
**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123"
}
```
**Response (`201 Created`):**
```json
{
  "message": "user registered successfully",
  "user": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "accessToken": "<redacted>"
  }
}
```

### Repairs (`/api/repairs`)

| Method | Endpoint | Access | Description | Status |
|---|---|---|---|---|
| `POST` | `/api/repairs` | Customer (Bearer access token) | Creates a new repair request ticket | Implemented |
| `GET` | `/api/repairs` | Customer (Bearer access token) | List repair requests | Incomplete; query/controller do not return repair records |
| `GET` | `/api/repairs/:id` | No authentication middleware | Read one repair request | Handler stub; currently unprotected |
| `POST` | `/api/repairs/:id/assign` | No authentication middleware | Assign technician to repair | Handler stub; currently unprotected |
| `POST` | `/api/repairs/:id/estimate` | No authentication middleware | Submit repair cost estimate | Handler stub; currently unprotected |
| `POST` | `/api/repairs/:id/estimate-response` | No authentication middleware | Approve or reject cost estimate | Handler stub; currently unprotected |
| `POST` | `/api/repairs/:id/start` | No authentication middleware | Transition repair to in-progress | Handler stub; currently unprotected |
| `POST` | `/api/repairs/:id/complete` | No authentication middleware | Mark repair as completed | Handler stub; currently unprotected |
| `POST` | `/api/repairs/:id/cancel` | No authentication middleware | Cancel repair request | Handler stub; currently unprotected |

> **Security note:** These lifecycle routes do not have authentication or role-authorization middleware wired in. Do not expose them for real use until access controls and handlers are implemented.

#### Example: Create Repair Request
**Request:**
```http
POST /api/repairs
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "deviceType": "laptop",
  "brand": "Dell",
  "model": "XPS 15",
  "issueDescription": "Display flickering intermittently and overheating under load."
}
```
**Response (`201 Created`):**
```json
{
  "message": "repair request created successfully",
  "repair": {
    "_id": "<synthetic-repair-id>",
    "customerId": "<synthetic-customer-id>",
    "deviceType": "laptop",
    "brand": "Dell",
    "model": "XPS 15",
    "issueDescription": "Display flickering intermittently and overheating under load.",
    "status": "REQUESTED",
    "statusHistory": [],
    "createdAt": "<timestamp>",
    "updatedAt": "<timestamp>"
  }
}
```

---

## Error Handling & Security

### Error Handling
- **Centralized Middleware**: Errors passed to `errorHandler.js` are formatted by the middleware at the end of the Express pipeline. Some controllers handle errors directly, so response formats are not yet fully consistent.
- **Production Information Shielding**: Errors handled by the middleware return a generic `Internal server error` message for server errors (`500`).
- **Route Not Found Handling**: Unmatched paths return a `404` status with `{ "error": { "message": "Route not found" } }`.

### Security Implementations
- **Credential Protection**: Passwords are saved exclusively as bcrypt hashes (10 rounds). Password hashes and secrets are never returned in user profile responses.
- **Session Revocation via Hashed Tokens**: Refresh tokens are signed with JWT and stored in MongoDB only after SHA-256 hashing (`refreshTokenHash`). If the database is compromised, raw refresh tokens are not exposed.
- **Cookie Hardening**: Refresh tokens use `httpOnly`, `secure`, and `sameSite: "strict"` cookie options. `httpOnly` prevents browser JavaScript from reading the cookie; `secure` limits it to HTTPS; `sameSite` helps reduce cross-site request forgery (CSRF).
- **Strict Role Boundaries**: Public registration does not permit role escalation; all newly registered users default to the `customer` role.
- **Field Whitelisting**: The `validateCreateRepair` validator explicitly blocks unexpected or prohibited fields from being passed in request bodies.
- **Environment Variable Checks**: Startup requires `MONGO_URI` and `JWT_SECRET`. The backend `.gitignore` excludes local `.env` files, but changes should still be reviewed before committing.

---

## Future Improvements

The following items are identified from the design documentation and codebase for ongoing development:

- **Complete Repair Lifecycle Logic**: Implement business logic for listing, assignment, technician estimates, customer approval/rejection, repair execution, completion, and cancellation in `repair.service.js` and `repair.controller.js`.
- **Repair Route Security**: Add authentication and role-based authorization to every repair lifecycle route before implementing or exposing those actions.
- **Role-Based Authorization Expansion**: Implement dedicated middlewares for `authorizedAdmin` and `authorizedTechnician` to secure assignment and technician workflow routes.
- **State Transition Guardrails**: Enforce strict server-side state machine validation to ensure repair status updates only follow valid lifecycle transitions.
- **Automated Testing Suite**: Establish integration and unit test suites for API routes using an isolated testing database.
- **Database Query Indexing**: Add database indexes for query patterns such as `{ customerId: 1, createdAt: -1 }` and `{ technicianId: 1, status: 1 }`.
- **Pagination & Query Scoping**: Introduce pagination and filtering on list endpoints (`GET /api/repairs`).
- **Standardized Error Envelope**: Unify all error response shapes across middleware and controllers into a single canonical JSON structure.

---

## Author & Repository

- **Repository**: [https://github.com/GaganNagar/RepairOps.git](https://github.com/GaganNagar/RepairOps.git)
- **Author**: Gagan Nagar (`GaganNagar`)
- **Documentation**: Located in the [`docs/`](./docs) directory for architectural specifications and task roadmaps.
