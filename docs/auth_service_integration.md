# Auth Service

Domain auth service in `src/domain/auth/service.ts`.

## Functions

### `extractOAuthUser(provider, payload): UserSession | null`

Normalizes OAuth provider data to `UserSession` schema.

```typescript
const user = extractOAuthUser("github", rawGitHubUser);
// => { name, login, email, provider, avatar } or null
```

Handles GitHub and Google. Returns `null` if data invalid.

### `getSessionCookieConfig(): CookieConfig`

Returns centralized cookie config (httpOnly, secure, maxAge, etc).

Used in OAuth callbacks and logout to ensure consistency.

## OAuth Flow

1. OAuth provider returns user data
2. `extractOAuthUser()` normalizes to schema
3. Validation happens in `schema.parse()`
4. `getSessionCookieConfig()` applied when setting cookie
5. Redirect to dashboard

## Files

- `src/domain/auth/service.ts` — Service functions
- `src/domain/auth/schema.ts` — Type definitions
- `src/domain/auth/constants.ts` — Configuration
- `src/server/auth.ts` — OAuth routes (uses service)
