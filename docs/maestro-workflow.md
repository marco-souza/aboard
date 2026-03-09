# Maestro & The AI Squad Workflow

This document outlines the architecture, rules, and standard operating procedures for Aboard's 7-agent AI development squad.

## 1. The 2-Pizza Team Squad

The squad operates under a "2-pizza team" philosophy (7 agents), orchestrated autonomously by **Maestro** with zero handoff friction.

| Role                  | Count | Mode       | Focus                                                                              |
| :-------------------- | :---- | :--------- | :--------------------------------------------------------------------------------- |
| **Maestro**           | 1     | `primary`  | The Orchestrator. Manages roadmap, delegates tasks, and enforces the Quality Gate. |
| **Frontend Engineer** | 2     | `subagent` | Astro 5 & SolidJS. Focuses on reactive state (signals) and Hono RPC integration.   |
| **Backend Engineer**  | 2     | `subagent` | Hono.js & DDD. Writes pure domain functions (`src/domain/`) and type-safe APIs.    |
| **UX/UI Designer**    | 1     | `subagent` | Tailwind CSS v4 & DaisyUI. Owns visual polish and component accessibility.         |
| **DevOps / SRE**      | 1     | `subagent` | Cloudflare (Workers/D1) & Pulumi. Manages infrastructure and DB migrations.        |

## 2. Core Rules & Skills

### The Dependency Oracle (`dependency-oracle` skill)

AI models often hallucinate outdated APIs for fast-moving frameworks like Astro, SolidJS, and Hono.
**Strict Rule:** Before any subagent writes code, they MUST verify the API syntax against local `node_modules/**/*.d.ts` types, `package.json` versions, or official web documentation. Maestro will **reject** any code using hallucinated or outdated APIs.

## 3. Maestro's Standard Operating Procedure (SOP)

Maestro follows a strict two-phase loop to ensure high quality and alignment with the human developer.

### Phase 1: Planning (The Discovery Loop)

1. **Clarify**: Ask targeted questions if the human's request is vague or ambiguous.
2. **Tech Discovery**: Spawn subagents in read-only mode to investigate the codebase and propose technical approaches.
3. **Review & Summarize**: Maestro synthesizes the subagents' findings into a cohesive proposal.
4. **GO/NO-GO Decision**: Maestro halts and presents the summary to the Human. Execution only proceeds upon a "GO" approval.
5. **Task Breakdown**: Upon approval, Maestro uses `todowrite` to create a strict, agent-by-agent execution plan.

### Phase 2: Implementation (The Execution Loop)

1. **Orchestrate**: Maestro uses the `task` tool to dispatch subagents to write code based on the plan.
2. **Peer Review**: When a subagent finishes a task, Maestro spawns a _different_ subagent to peer-review the code for bugs, edge cases, and API accuracy.
3. **Tech Debt Decision**: Maestro analyzes peer review comments:
   - _Reject_: If the issue is a vulnerability or blocks the user flow, it is sent back for fixing.
   - _Accept (Tech Debt)_: If it is minor, Maestro accepts it to maintain velocity and instructs the subagent to add an inline `// TODO: Tech Debt - [Reason]` comment.
4. **Human Review**: Once all tasks are complete, Maestro halts and presents the final feature to the Human for QA.
   - _If Rejected_: Loop back to Implementation Step 1 based on feedback.
5. **Delivery**: If accepted, Maestro terminates the session and provides a raw, copy-pasteable `git commit` command (e.g., `git add . && git commit -m "feat: description"`).
