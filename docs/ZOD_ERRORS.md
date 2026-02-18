# Zod Error Handling Library

A collection of utilities for handling Zod validation errors in a type-safe and developer-friendly way.

## Best Practices (Research Summary)

### 1. Error Formatting Strategies

Zod provides three main approaches to error formatting:

- **`flatten()`** — Best for flat, single-level schemas (forms, APIs)
- **`treeify()`** — Best for deeply nested schemas with complex hierarchies
- **`format()`** — Deprecated, use `flatten()` or `treeify()` instead

### 2. Error Precedence

When multiple error customizations are defined, they follow this precedence (highest to lowest):

1. Schema-level errors (hardcoded in schema definition)
2. Per-parse errors (passed to `.parse()` or `.safeParse()`)
3. Global error map (set via `z.config()`)
4. Locale error map (i18n defaults)

### 3. Issue Structure

Every `ZodIssue` contains:

- **`code`** — Error type (e.g., `invalid_type`, `too_small`, `custom`)
- **`path`** — Array indicating location of error (e.g., `["user", 0, "email"]`)
- **`message`** — Human-readable error description
- **Additional fields** — Depend on the error code (e.g., `expected`, `received` for `invalid_type`)

### 4. Custom Error Messages

Always customize error messages at the schema level for better maintainability:

```typescript
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

### 5. Input Validation Pattern

For type-safe validation with error handling:

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  // Errors are strongly typed and accessible
  const formatted = flattenZodError(result.error);
  return { success: false, errors: formatted };
}

// result.data is now correctly typed
return { success: true, data: result.data };
```

---

## Library API

### Core Functions

#### `flattenZodError(error: ZodError): FlattenedError`

Flattens a ZodError into field and form-level errors. Ideal for form validation.

```typescript
const result = schema.safeParse(data);
if (!result.success) {
  const errors = flattenZodError(result.error);
  // errors.fieldErrors: { email: ["..."], name: ["..."] }
  // errors.formErrors: ["..."]
}
```

#### `formatZodErrors(error: ZodError): FormattedIssue[]`

Converts errors into an array of field+message pairs. Great for API responses.

```typescript
const errors = formatZodErrors(result.error);
// => [
//   { field: "email", message: "Invalid format", code: "invalid_string" },
//   { field: "user.age", message: "Must be positive", code: "too_small" }
// ]
```

#### `createErrorSummary(error: ZodError): string`

Creates a human-readable error summary combining all errors.

```typescript
const summary = createErrorSummary(result.error);
// => "email: Invalid format. age: Must be > 0."
```

### Field-Specific Helpers

#### `getFirstFieldError(flattened: FlattenedError, field: string): string | undefined`

Gets the first error message for a specific field.

```typescript
const errors = flattenZodError(result.error);
const emailError = getFirstFieldError(errors, "email");
```

#### `getFieldErrors(flattened: FlattenedError, field: string): string[]`

Gets all error messages for a specific field.

```typescript
const emailErrors = getFieldErrors(errors, "email");
// => ["Invalid format", "Already in use"]
```

#### `hasFieldError(flattened: FlattenedError, field: string): boolean`

Checks if a field has validation errors.

```typescript
if (hasFieldError(errors, "email")) {
  // Show error state for email input
}
```

### Form-Level Helpers

#### `hasFormError(flattened: FlattenedError): boolean`

Checks for top-level form errors (not field-specific).

#### `getFormErrors(flattened: FlattenedError): string[]`

Gets all form-level error messages.

### Advanced Utilities

#### `formatPath(path: (string | number)[]): string`

Converts nested path array to dot notation.

```typescript
formatPath(["user", 0, "email"]); // => "user.0.email"
```

#### `groupIssuesByField(issues: ZodIssue[]): Record<string, ZodIssue[]>`

Groups validation issues by field path.

```typescript
const grouped = groupIssuesByField(error.issues);
// => {
//   "email": [{ code: "invalid_string", ... }],
//   "user.age": [{ code: "too_small", ... }]
// }
```

#### `createFormFieldErrorMap(error: ZodError): Record<string, string>`

Creates a field→error mapping for forms (one error per field).

```typescript
const errorMap = createFormFieldErrorMap(result.error);
// => { email: "Invalid email", age: "Must be positive" }
// Perfect for binding to form inputs
```

#### `parseWithErrors<T>(schema, data): Result<T>`

Convenience wrapper that validates and formats errors in one step.

```typescript
const result = parseWithErrors(schema, data);

if (!result.success) {
  // result.errors: FlattenedError
  // result.summary: string
} else {
  // result.data: T (correctly typed)
}
```

---

## Usage Examples

### Form Validation (SolidJS)

```typescript
import { flattenZodError, hasFieldError, getFirstFieldError } from "~/lib/zod-errors";

export function LoginForm() {
  const [errors, setErrors] = createSignal<FlattenedError | null>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      setErrors(flattenZodError(result.error));
      return;
    }

    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />
      <Show when={hasFieldError(errors(), "email")}>
        <span class="error">{getFirstFieldError(errors(), "email")}</span>
      </Show>

      <input name="password" type="password" />
      <Show when={hasFieldError(errors(), "password")}>
        <span class="error">{getFirstFieldError(errors(), "password")}</span>
      </Show>

      <button type="submit">Login</button>
    </form>
  );
}
```

### API Response Formatting

```typescript
import { formatZodErrors } from "~/lib/zod-errors";

export async function POST(req: Request) {
  const data = await req.json();
  const result = userSchema.safeParse(data);

  if (!result.success) {
    return Response.json(
      {
        error: "Validation failed",
        details: formatZodErrors(result.error),
      },
      { status: 400 },
    );
  }

  // Process data...
}
```

### Domain Service Validation

```typescript
import { createErrorSummary } from "~/lib/zod-errors";
import type { FlattenedError } from "~/lib/zod-errors";

export function validateUser(
  data: unknown,
): { ok: true; user: User } | { ok: false; summary: string } {
  const result = userSchema.safeParse(data);

  if (!result.success) {
    return {
      ok: false,
      summary: createErrorSummary(result.error),
    };
  }

  return { ok: true, user: result.data };
}
```

---

## Integration with Auth Service

The auth service uses `createErrorSummary()` for clean error messages:

```typescript
export function validateSessionData(data: unknown) {
  const result = sessionDataSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: createErrorSummary(result.error), // User-friendly message
    };
  }
  return { valid: true, data: result.data };
}
```

---

## When to Use Each Function

| Function                    | Best For                                |
| --------------------------- | --------------------------------------- |
| `flattenZodError()`         | Form validation, UI state               |
| `formatZodErrors()`         | API responses, detailed error reporting |
| `createErrorSummary()`      | Logging, user messages, notifications   |
| `getFirstFieldError()`      | Inline form field errors                |
| `createFormFieldErrorMap()` | Binding errors to form inputs           |
| `groupIssuesByField()`      | Complex error organization              |
| `parseWithErrors()`         | One-step validation wrapper             |

---

## References

- [Zod Error Customization](https://zod.dev/error-customization)
- [Zod Error Formatting](https://zod.dev/error-formatting)
- [Zod Basic Usage](https://zod.dev/basics)
