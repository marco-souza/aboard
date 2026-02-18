import type { ZodError, ZodIssue } from "zod";

/**
 * Represents a flattened validation error structure.
 * Useful for form validation and API responses.
 */
export interface FlattenedError {
  /** Top-level form errors (path is empty) */
  formErrors: string[];
  /** Field-specific errors mapped by field name */
  fieldErrors: Record<string, string[]>;
}

/**
 * Represents a formatted error for API responses.
 */
export interface FormattedIssue {
  /** Dot-notated path to the invalid field (e.g., "user.address.zipCode") */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Error code from Zod (e.g., "invalid_type", "too_small") */
  code: string;
}

/**
 * Flattens a Zod error into field errors and form-level errors.
 * Best for simple, flat schemas (no deeply nested objects).
 *
 * @example
 * ```ts
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   const errors = flattenZodError(result.error);
 *   console.log(errors.fieldErrors.email); // => ["Invalid email format"]
 * }
 * ```
 */
export function flattenZodError(error: ZodError): FlattenedError {
  const flattened = error.flatten();
  return {
    formErrors: flattened.formErrors,
    fieldErrors: flattened.fieldErrors as Record<string, string[]>,
  };
}

/**
 * Formats Zod errors into a simple array of field+message pairs.
 * Useful for API responses and detailed error reporting.
 *
 * @example
 * ```ts
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   const errors = formatZodErrors(result.error);
 *   // => [
 *   //   { field: "email", message: "Invalid email", code: "invalid_string" },
 *   //   { field: "user.age", message: "Must be > 0", code: "too_small" }
 *   // ]
 * }
 * ```
 */
export function formatZodErrors(error: ZodError): FormattedIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Gets the first field error message from a flattened error object.
 * Useful when you only need to display one error at a time.
 *
 * @example
 * ```ts
 * const errors = flattenZodError(error);
 * const firstError = getFirstFieldError(errors, "email");
 * // => "Invalid email format" or undefined
 * ```
 */
export function getFirstFieldError(
  flattened: FlattenedError,
  field: string,
): string | undefined {
  return flattened.fieldErrors[field]?.[0];
}

/**
 * Gets all errors for a specific field from a flattened error object.
 *
 * @example
 * ```ts
 * const errors = flattenZodError(error);
 * const emailErrors = getFieldErrors(errors, "email");
 * // => ["Invalid format", "Already in use"]
 * ```
 */
export function getFieldErrors(
  flattened: FlattenedError,
  field: string,
): string[] {
  return flattened.fieldErrors[field] ?? [];
}

/**
 * Checks if a field has validation errors.
 *
 * @example
 * ```ts
 * const errors = flattenZodError(error);
 * if (hasFieldError(errors, "email")) {
 *   // Show error for email field
 * }
 * ```
 */
export function hasFieldError(
  flattened: FlattenedError,
  field: string,
): boolean {
  return (flattened.fieldErrors[field] ?? []).length > 0;
}

/**
 * Checks if there are any form-level errors (not field-specific).
 *
 * @example
 * ```ts
 * const errors = flattenZodError(error);
 * if (hasFormError(errors)) {
 *   // Show top-level form error
 * }
 * ```
 */
export function hasFormError(flattened: FlattenedError): boolean {
  return flattened.formErrors.length > 0;
}

/**
 * Gets all form-level errors (not field-specific).
 *
 * @example
 * ```ts
 * const errors = flattenZodError(error);
 * const topLevelErrors = getFormErrors(errors);
 * // => ["Missing form data", "Invalid combination"]
 * ```
 */
export function getFormErrors(flattened: FlattenedError): string[] {
  return flattened.formErrors;
}

/**
 * Creates a user-friendly error summary from Zod issues.
 * Combines field errors with form errors into a single message.
 *
 * @example
 * ```ts
 * const summary = createErrorSummary(error);
 * // => "email: Invalid format. age: Must be > 0. Form error: Missing required field."
 * ```
 */
export function createErrorSummary(error: ZodError): string {
  const flattened = flattenZodError(error);
  const parts: string[] = [];

  // Add field errors
  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    messages.forEach((msg) => {
      parts.push(`${field}: ${msg}`);
    });
  }

  // Add form errors
  flattened.formErrors.forEach((msg) => {
    parts.push(msg);
  });

  return parts.join(". ");
}

/**
 * Parses nested path arrays into dot-notation strings.
 * Handles both object fields and array indices.
 *
 * @example
 * ```ts
 * formatPath(["user", 0, "email"]) // => "user.0.email"
 * formatPath(["address", "zipCode"]) // => "address.zipCode"
 * formatPath(["email"]) // => "email"
 * ```
 */
export function formatPath(path: (string | number)[]): string {
  return path.join(".");
}

/**
 * Groups Zod issues by their field path.
 * Useful for organizing errors by location in the data structure.
 *
 * @example
 * ```ts
 * const grouped = groupIssuesByField(error.issues);
 * // => {
 * //   "email": [{ code: "invalid_string", message: "..." }],
 * //   "user.age": [{ code: "too_small", message: "..." }]
 * // }
 * ```
 */
export function groupIssuesByField(
  issues: ZodIssue[],
): Record<string, ZodIssue[]> {
  const grouped: Record<string, ZodIssue[]> = {};

  for (const issue of issues) {
    const field = formatPath(issue.path) || "root";
    if (!grouped[field]) {
      grouped[field] = [];
    }
    grouped[field].push(issue);
  }

  return grouped;
}

/**
 * Creates a mapping suitable for HTML form field validation.
 * Maps field names to first error message per field.
 *
 * @example
 * ```ts
 * const formErrors = createFormFieldErrorMap(error);
 * // => { email: "Invalid email", age: "Must be positive" }
 * ```
 */
export function createFormFieldErrorMap(
  error: ZodError,
): Record<string, string> {
  const flattened = flattenZodError(error);
  const fieldMap: Record<string, string> = {};

  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    if (messages.length > 0) {
      fieldMap[field] = messages[0];
    }
  }

  return fieldMap;
}

/**
 * Validates that data matches a Zod schema and returns structured errors.
 * This is a convenience wrapper combining validation and error formatting.
 *
 * @example
 * ```ts
 * const result = parseWithErrors(schema, data);
 * if (!result.success) {
 *   console.log(result.errors.fieldErrors);
 * } else {
 *   console.log(result.data);
 * }
 * ```
 */
export function parseWithErrors<T>(
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: T;
      error?: ZodError;
    };
  },
  data: unknown,
):
  | { success: true; data: T }
  | { success: false; errors: FlattenedError; summary: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: flattenZodError(result.error),
      summary: createErrorSummary(result.error),
    };
  }

  return { success: true, data: result.data };
}
