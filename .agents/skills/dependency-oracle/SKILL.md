---
name: dependency-oracle
description: "Verify actual framework API syntax, versions, and types before writing code (Astro, SolidJS, Hono, Tailwind)."
---

# Dependency Oracle Skill

Ensures all framework and library code written uses the correct, currently installed version's API syntax, preventing AI hallucination of outdated APIs.

## Triggers

Run this skill whenever you:

- Are about to write or modify Astro pages or routing logic.
- Are about to implement SolidJS reactivity (signals, stores, contexts).
- Are defining Hono RPC handlers or Zod schemas.
- Are styling components with Tailwind CSS (especially verifying v4 utility class syntax).

## Standard Workflow

Before writing code for these frameworks, perform the following validation:

1. **Check Installed Version**:

   ```bash
   cat package.json | grep -i [framework-name]
   ```

2. **Inspect Local Types (Primary source of truth)**:
   - Use `read`, `glob`, or `grep` to look inside `node_modules/[framework-name]/` (especially the `.d.ts` files).
   - _Example for Hono_: Check `node_modules/hono/dist/types/` to see exact method signatures.
   - _Example for SolidJS_: Check `node_modules/solid-js/types/` for reactivity functions.

3. **Verify Documentation (If local types are insufficient)**:
   - Use the `webfetch` tool to retrieve the official documentation for the specific version installed.
   - _Example_: `webfetch(url: "https://hono.dev/docs/")`

4. **Implement**:
   - Only write the code _after_ confirming the exact API signature and usage pattern.

## Strict Rules

- **NEVER** assume an API's usage based on training data without verifying it first, especially for Astro 5, SolidJS, and Hono.
- If you are peer-reviewing another agent's code, you must use this skill to verify they did not use outdated or hallucinated APIs.
- Pay special attention to Hono's Context (`c`) object, SolidJS's `createSignal`/`createStore` differences, and Astro's `Astro.request` / `Astro.locals` APIs.
