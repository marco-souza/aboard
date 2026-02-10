import { describe, expect } from "vitest";
import { UserService } from "./service";

describe("validate service was created", () => {
  expect(UserService).not.toBeNull();
});
