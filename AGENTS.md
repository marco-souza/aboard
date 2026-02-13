# AGENTS.md - Aboard Project Guide

## Build, Lint & Test Commands

- **Dev**: `bun run dev` (localhost:4321)
- **Build**: `bun run build` → `dist/`
- **Lint**: `bun run lint` (check) or `bun run fix` (auto-fix + format)
- **Test**: `bun run test` (Vitest with globals, node env)
- **Single test**: `bun run test -- path/to/file.test.ts` or `bun run test --
--grep "test name"`
- **Test UI**: `bun run test:ui`
- **API client**: Hono RPC via `hc` (`src/lib/api-client.ts`), type-safe with no
  codegen

## Architecture & Structure

- **Framework**: Astro 5 + SolidJS + Tailwind CSS (DaisyUI)
- **Backend**: Hono.js (REST API), deployed to Cloudflare Workers
- **Frontend**: Astro pages + SolidJS components, static generation
- **src/**: `pages/` (routes), `components/`, `layouts/`, `server/` (Hono API
  handlers), `stores/`, `lib/`, `config/`, `assets/`, `styles/`
- **API routes**: `src/server/router.ts` (Hono app), health.ts, auth.ts (OAuth),
  users.ts. Router exports `AppType` for the Hono RPC client.
- **Domain**: `src/domain/` organized by feature (`user/`, `auth/`) plus
  `shared/` for cross-cutting schemas (`pagination.ts`, `provider.ts`). Compose
  shared schemas with domain-specific ones via `.extend()`.
  - `domain/shared/` — reusable schemas (pagination, provider enum)
  - `domain/auth/` — session schemas, session constants (cookie config)
  - `domain/user/` — user entity, CRUD DTOs, user service
- **API client**: `src/lib/api-client.ts` uses `hc` from `hono/client` with the
  `hcWithType` pattern for pre-compiled types and better IDE performance
- **DB**: Managed via Cloudflare D1
- **Auth**: OAuth providers via @hono/oauth-providers
- **Validation**: Zod for config, domain schemas, and request validation
- **Path alias**: `~/` maps to `./src/`

## Code Style & Conventions

- **Language**: TypeScript (strict mode), format: double quotes, 2-space indent
- **Linting**: Biome (recommended rules) with org-imports (`:PACKAGE:`,
  `:ALIAS:`)
- **Astro/SolidJS files**: imports/unused rules disabled
- **Testing**: Vitest globals enabled, write `.test.ts` files
- **Formatting**: Biome auto-formats on save; Lefthook pre-commit hooks
  enforce it
- **CSS**: Tailwind directives enabled, use utility classes + DaisyUI
- **Error handling**: Use Zod for validation, consistent error responses
- **Imports**: Organize by groups (packages, then aliases), prefer named exports
- **Hono routes**: Always chain handlers (`.get().post()`) instead of separate
  calls — required for Hono RPC type inference. Export `typeof routes` from
  the router so the `hc` client can infer all endpoint types.

## Domain Layer Patterns

When building domain-specific features (e.g., Kanban boards):

- **Schemas**: Define all domain types with Zod (value objects, entities, DTOs)
  - Use `z.infer<typeof Schema>` for TypeScript types (single source of truth)
  - Include business rule refinements in schemas
  - No barrel files (`index.ts`) in domain layer - import directly from files
    (avoids circular deps)
  - Place reusable schemas (pagination, sorting, etc.) in `domain/shared/`
  - Compose shared schemas with domain-specific ones via `.extend()`
- **Services**: Pure domain functions with no side effects
  - Testable in isolation, no mocking needed
  - Take domain objects as inputs, return modified copies (immutable)
  - Include validation helpers
  - Keep in separate files to prevent circular dependencies
- **State Management**: Use SolidJS signals for reactive updates
  - Support optimistic updates: update UI immediately, sync with backend
    asynchronously
  - Separate UI state (drag state, loading, error) from domain state
  - Validation at store level (use domain services)

- **Testing**: Pure functions = easy unit testing
  - Create fixtures for test data
  - Test happy path + edge cases (non-existent items, duplicates, invariants)
  - No mocking for pure functions
