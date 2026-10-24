# Phase 4 — Initial Project Setup Plan

Status: completed and verified on 2026-10-19.

## Task 1: Inspect the environment and current repository

Before creating files, inspect the current directory, Git status and `package.json` if one exists. Avoid overwriting existing work.

## Task 2: Initialize only if needed

If this is a new project directory:
```powershell
npm init -y
```

## Task 3: Install minimum dependencies

```powershell
npm install express mongoose dotenv
npm install -D nodemon
```

Do not add authentication, validation or testing libraries until their use is planned for a relevant task. When ready, choose appropriate libraries and document the reason.

## Task 4: Protect secrets

Suggested `.gitignore`:
```gitignore
node_modules/
.env
.env.*
!.env.example
```

Create `.env.example` with placeholder values only. Never place real credentials in it.

If `.env` has already been pushed:
- Rotate exposed credentials immediately.
- Remove the file from current tracking with the correct path.
- Remember that untracking/deleting it does not remove secrets from prior commits; history cleanup may be required.

## Task 5: Create the initial source structure

```text
src/
├── config/
├── middlewares/
├── modules/
├── app.js
└── server.js
```

Do not create every future module file before it is needed.

## Task 6: Implement the smallest working bootstrap

- Configure Express in `app.js`.
- Start the server from `server.js`.
- Add a simple health endpoint.
- Verify the endpoint and a missing route.
- Keep database connection handling as a distinct next task unless included in the reviewed setup plan.

## Acceptance criteria

- Dependencies install without errors.
- `.env` is ignored by Git.
- Server starts and stops predictably.
- Health endpoint returns the expected response.
- Missing route returns a consistent error response.
- The developer can explain the difference between `app.js` and `server.js`.

Do not proceed until the current task is tested and understood.
