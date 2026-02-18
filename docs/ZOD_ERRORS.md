# Zod Error Utilities

Error handling helpers in `src/lib/zod-errors.ts`.

## Main Functions

| Function                    | Use                                            |
| --------------------------- | ---------------------------------------------- |
| `flattenZodError()`         | Forms — get `{ formErrors, fieldErrors }`      |
| `formatZodErrors()`         | APIs — get array of `{ field, message, code }` |
| `createErrorSummary()`      | Logging/messages — get single string           |
| `getFirstFieldError()`      | Inline errors — get one message per field      |
| `createFormFieldErrorMap()` | Form binding — get `{ field: message }` map    |
| `groupIssuesByField()`      | Complex errors — get `{ field: [issues] }`     |
| `parseWithErrors()`         | One-liner — validate & format together         |

## Quick Example

```typescript
import { flattenZodError, hasFieldError } from "~/lib/zod-errors";

const result = schema.safeParse(data);
if (!result.success) {
  const errors = flattenZodError(result.error);
  if (hasFieldError(errors, "email")) {
    // Show error
  }
}
```

## See Also

- Zod docs: https://zod.dev/error-formatting
