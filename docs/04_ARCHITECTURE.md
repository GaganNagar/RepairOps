# FixFlow — Backend Architecture

## Style

Feature-based modular monolith. One application/deployment, with modules separated by business capability. Do not introduce microservices without a demonstrated need.

## Proposed structure

```text
src/
├── config/
│   ├── env.js
│   └── database.js
├── modules/
│   ├── auth/
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   └── auth.validation.js
│   ├── users/
│   │   ├── user.model.js
│   │   └── user.service.js
│   ├── repairs/
│   │   ├── repair.routes.js
│   │   ├── repair.controller.js
│   │   ├── repair.service.js
│   │   ├── repair.model.js
│   │   └── repair.validation.js
│   └── sessions/
│       └── session.model.js
├── middlewares/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── validate.js
│   └── errorHandler.js
├── app.js
└── server.js
```

The structure may change if implementation reveals a real need. Avoid creating files merely to match a template.

## Responsibilities

- Routes: map HTTP method/path to middleware and controller.
- Controllers: translate HTTP request/response; keep business logic thin.
- Services: enforce business rules and coordinate operations.
- Models: describe persistence schema and model-level constraints.
- Validation: validate incoming request data.
- Middleware: cross-cutting request processing such as authentication, authorization, validation and centralized errors.
- `app.js`: configure Express, shared middleware and routes; export the app without necessarily opening a port.
- `server.js`: load validated configuration, connect to the database and start listening; handle startup failures and graceful shutdown.
- `config/`: environment and database configuration.

## Typical request flow

Client → Express middleware → route → authentication/authorization/validation middleware as configured → controller → service → model/database → response.

Not every request uses every middleware. Central error middleware handles forwarded errors. The order in which Express middleware is registered matters.

## Layer-based versus feature-based

Layer-based:
```text
routes/
controllers/
models/
services/
```

Feature-based:
```text
modules/auth/
modules/users/
modules/repairs/
```

FixFlow uses feature-based organization for feature-specific files, while shared infrastructure such as middleware and config remains shared.

## Security design principles

- Authentication proves identity; authorization checks what that identity can do.
- Never rely on frontend role checks as the security boundary.
- Apply ownership filters in backend queries/services.
- Do not accept protected fields from untrusted request bodies.
- Centralize errors without exposing stack traces or secrets in production.
- Validate environment variables at startup.
