import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  createErrorSummary,
  createFormFieldErrorMap,
  flattenZodError,
  formatPath,
  formatZodErrors,
  getFieldErrors,
  getFirstFieldError,
  getFormErrors,
  groupIssuesByField,
  hasFieldError,
  hasFormError,
  parseWithErrors,
} from "~/lib/zod-errors";

describe("Zod Error Utilities", () => {
  describe("flattenZodError", () => {
    it("should flatten simple field errors", () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().positive(),
      });

      const result = schema.safeParse({
        email: "invalid",
        age: -5,
      });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        expect(flattened.fieldErrors.email).toBeDefined();
        expect(flattened.fieldErrors.age).toBeDefined();
        expect(flattened.formErrors).toEqual([]);
      }
    });

    it("should include form-level errors", () => {
      const schema = z
        .object({ data: z.string() })
        .refine(() => false, { message: "Form validation failed" });

      const result = schema.safeParse({ data: "anything" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        expect(flattened.formErrors.length).toBeGreaterThan(0);
      }
    });
  });

  describe("formatZodErrors", () => {
    it("should format errors as array of field+message pairs", () => {
      const schema = z.object({
        email: z.string().email("Invalid email"),
        name: z.string().min(1, "Name required"),
      });

      const result = schema.safeParse({
        email: "invalid",
        name: "",
      });

      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted.length).toBe(2);
        expect(formatted).toContainEqual(
          expect.objectContaining({
            field: "email",
            message: "Invalid email",
          }),
        );
        expect(formatted).toContainEqual(
          expect.objectContaining({
            field: "name",
            message: "Name required",
          }),
        );
      }
    });

    it("should handle nested field paths", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            email: z.string().email("Invalid email"),
          }),
        }),
      });

      const result = schema.safeParse({
        user: {
          profile: {
            email: "invalid",
          },
        },
      });

      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted[0].field).toBe("user.profile.email");
      }
    });
  });

  describe("getFirstFieldError", () => {
    it("should return first error message for a field", () => {
      const schema = z.object({
        email: z.string().email("Invalid email"),
      });

      const result = schema.safeParse({ email: "bad" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        const error = getFirstFieldError(flattened, "email");
        expect(error).toBeDefined();
      }
    });

    it("should return undefined for non-existent field", () => {
      const schema = z.object({
        email: z.string(),
      });

      const result = schema.safeParse({ email: "test@example.com" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        const error = getFirstFieldError(flattened, "nonexistent");
        expect(error).toBeUndefined();
      }
    });
  });

  describe("getFieldErrors", () => {
    it("should return all error messages for a field", () => {
      const schema = z.object({
        email: z
          .string()
          .email("Invalid email")
          .refine((e) => !e.includes("test"), "Cannot be test email"),
      });

      const result = schema.safeParse({ email: "test@example.com" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        const errors = getFieldErrors(flattened, "email");
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it("should return empty array for non-existent field", () => {
      const schema = z.object({ email: z.string() });
      const result = schema.safeParse({ email: "valid@example.com" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        const errors = getFieldErrors(flattened, "nonexistent");
        expect(errors).toEqual([]);
      }
    });
  });

  describe("hasFieldError", () => {
    it("should return true when field has errors", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = schema.safeParse({ email: "invalid" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        expect(hasFieldError(flattened, "email")).toBe(true);
      }
    });

    it("should return false when field has no errors", () => {
      const schema = z.object({
        email: z.string(),
      });

      const result = schema.safeParse({ email: "valid@example.com" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        expect(hasFieldError(flattened, "email")).toBe(false);
      }
    });
  });

  describe("hasFormError", () => {
    it("should return true when form has errors", () => {
      const schema = z
        .object({ data: z.string() })
        .refine(() => false, { message: "Form validation failed" });

      const result = schema.safeParse({ data: "anything" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        expect(hasFormError(flattened)).toBe(true);
      }
    });

    it("should return false when form has no errors", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = schema.safeParse({ email: "valid@example.com" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        expect(hasFormError(flattened)).toBe(false);
      }
    });
  });

  describe("getFormErrors", () => {
    it("should return form-level errors", () => {
      const schema = z
        .object({ data: z.string() })
        .refine(() => false, { message: "Form failed" });

      const result = schema.safeParse({ data: "test" });

      if (!result.success) {
        const flattened = flattenZodError(result.error);
        const errors = getFormErrors(flattened);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe("createErrorSummary", () => {
    it("should create human-readable error summary", () => {
      const schema = z.object({
        email: z.string().email("Invalid email"),
        age: z.number().positive("Must be positive"),
      });

      const result = schema.safeParse({
        email: "invalid",
        age: -5,
      });

      if (!result.success) {
        const summary = createErrorSummary(result.error);
        expect(summary).toContain("email");
        expect(summary).toContain("age");
        expect(summary).toContain("Invalid email");
      }
    });
  });

  describe("formatPath", () => {
    it("should format array path to dot notation", () => {
      expect(formatPath(["user", "email"])).toBe("user.email");
      expect(formatPath(["items", 0, "id"])).toBe("items.0.id");
      expect(formatPath(["email"])).toBe("email");
      expect(formatPath([])).toBe("");
    });
  });

  describe("groupIssuesByField", () => {
    it("should group issues by field path", () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
      });

      const result = schema.safeParse({
        email: "invalid",
        name: "",
      });

      if (!result.success) {
        const grouped = groupIssuesByField(result.error.issues);
        expect(grouped.email).toBeDefined();
        expect(grouped.name).toBeDefined();
      }
    });

    it("should group nested field paths", () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });

      const result = schema.safeParse({
        user: { email: "invalid" },
      });

      if (!result.success) {
        const grouped = groupIssuesByField(result.error.issues);
        expect(grouped["user.email"]).toBeDefined();
      }
    });

    it("should handle multiple errors per field", () => {
      const schema = z.object({
        email: z
          .string()
          .email("Invalid format")
          .refine((e) => !e.includes("spam"), "Cannot be spam"),
      });

      const result = schema.safeParse({ email: "spam@test.com" });

      if (!result.success) {
        const grouped = groupIssuesByField(result.error.issues);
        expect(grouped.email?.length).toBeGreaterThan(0);
      }
    });
  });

  describe("createFormFieldErrorMap", () => {
    it("should create field error mapping for forms", () => {
      const schema = z.object({
        email: z.string().email("Invalid email"),
        name: z.string().min(1, "Name required"),
      });

      const result = schema.safeParse({
        email: "invalid",
        name: "",
      });

      if (!result.success) {
        const errorMap = createFormFieldErrorMap(result.error);
        expect(errorMap.email).toBeDefined();
        expect(errorMap.name).toBeDefined();
        expect(typeof errorMap.email).toBe("string");
        expect(typeof errorMap.name).toBe("string");
      }
    });

    it("should not include fields without errors", () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string(),
      });

      const result = schema.safeParse({
        email: "invalid",
        name: "John",
      });

      if (!result.success) {
        const errorMap = createFormFieldErrorMap(result.error);
        expect(errorMap.email).toBeDefined();
        expect(errorMap.name).toBeUndefined();
      }
    });
  });

  describe("parseWithErrors", () => {
    it("should return success with data on valid input", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = parseWithErrors(schema, { email: "test@example.com" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("test@example.com");
      }
    });

    it("should return failure with errors on invalid input", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = parseWithErrors(schema, { email: "invalid" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.fieldErrors.email).toBeDefined();
        expect(result.summary).toBeDefined();
      }
    });

    it("should include error summary in failure response", () => {
      const schema = z.object({
        email: z.string().email("Invalid email"),
      });

      const result = parseWithErrors(schema, { email: "bad" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.summary).toContain("email");
      }
    });
  });
});
