import type { ZodError } from "zod";

/**
 * Flattens a Zod error into field errors and form-level errors.
 */
export interface FlattenedError {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

/**
 * Creates a user-friendly error summary from Zod issues.
 */
export function createErrorSummary(error: ZodError): string {
  const parts: string[] = [];

  // Add field errors
  for (const issue of error.issues) {
    if (issue.path.length > 0) {
      parts.push(`${issue.path.join(".")}: ${issue.message}`);
    } else {
      parts.push(issue.message);
    }
  }

  return parts.join(". ");
}
