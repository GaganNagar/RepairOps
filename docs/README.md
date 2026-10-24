# FixFlow Backend — Project Documentation

This folder contains the planning documents created before implementation. Keep these files in the FixFlow repository so your coding AI can read the project's context instead of guessing requirements.

## Documents

1. `00_PROJECT_OVERVIEW.md` — project scope and goals
2. `01_PHASE_1_REQUIREMENTS.md` — actors, permissions, business rules
3. `02_PHASE_2_API_CONTRACT.md` — planned API endpoints and response conventions
4. `03_PHASE_3_DATABASE_DESIGN.md` — collections, fields, relationships and indexes
5. `04_ARCHITECTURE.md` — module boundaries and request flow
6. `05_AI_ASSISTED_WORKFLOW.md` — how to use AI without giving up code ownership
7. `06_PHASE_4_SETUP_PLAN.md` — first implementation tasks
8. `07_PROJECT_STATUS.md` — what is planned versus actually implemented
9. `AI_CONTEXT.md` — compact context file to give a coding agent first

## How to use these documents

- Copy this `docs/` folder into the root of your `fixflow-backend` repository.
- Before asking your coding agent to work, ask it to read `docs/AI_CONTEXT.md` and the specific document relevant to the task.
- For every task, ask the agent to inspect the existing code before proposing edits.
- Update `07_PROJECT_STATUS.md` only after you have actually completed and verified a task.
- These documents describe the plan, not proof that code exists or works.
