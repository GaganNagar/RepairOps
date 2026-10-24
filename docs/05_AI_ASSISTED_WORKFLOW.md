# AI-Assisted Coding Workflow for FixFlow

Goal: learn backend engineering while learning to use AI effectively. AI helps with reasoning and implementation; the developer remains responsible for decisions, code understanding and verification.

## Repeat this loop for each small task

1. **Understand:** Learn the relevant backend concept and why the feature is needed.
2. **Plan:** Write down inputs, outputs, permissions, failure cases and acceptance criteria.
3. **Ask AI to analyze:** Provide project context and ask it to inspect existing files. Ask for a plan before edits when scope is uncertain.
4. **Attempt the code yourself:** Try the small implementation or write pseudocode first.
5. **Use AI for focused implementation:** One bounded task, not the whole backend.
6. **Review the diff:** Understand every changed file and reject unrelated changes.
7. **Test:** Run the server/tests and test success and failure paths.
8. **Debug:** Reproduce the failure, identify the root cause, then apply and verify a fix.
9. **Update status:** Record only work that was actually completed and verified.

## Prompt template

```text
We are building FixFlow, a Node.js + Express + MongoDB backend using a
feature-based modular monolith.

Read docs/AI_CONTEXT.md and the relevant phase document first.
Inspect the current project files before proposing changes.

Task: <one specific task>

Before coding:
1. Explain the responsibility and request/data flow.
2. Identify validation, authorization, failure cases and assumptions.
3. Propose the smallest implementation plan.

Constraints:
- Do not invent requirements.
- Do not rewrite unrelated files.
- Preserve existing behaviour.
- Do not claim a test passed unless you ran it and can report the result.

After implementation:
1. List changed files and why.
2. Explain the important code paths.
3. Run relevant checks and report actual output.
4. List anything not implemented or verified.
```

## Rules

- Do not ask AI to build the entire backend in one prompt.
- Do not accept "production-ready" as evidence.
- Do not paste secrets into prompts or commit them to Git.
- Ask for hints before full solutions when the goal is learning.
- Inspect diffs and run tests independently.
- Ask AI to explain alternatives and trade-offs, not just provide code.
- If AI changes files, verify the actual diff instead of trusting its summary.
- Keep tasks small enough that you can explain and test them.

## What to learn over time

1. Repository/context analysis and task decomposition
2. Prompting with scope, constraints and acceptance criteria
3. Code generation and diff review
4. Debugging and root-cause analysis
5. Test generation and independent verification
6. Git commits, rollback and safe change management
7. Refactoring and repository-wide agent workflows
8. Security review and deployment verification
