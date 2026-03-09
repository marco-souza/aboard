/**
 * Base class for all domain-specific errors.
 * Used to distinguish business rule violations from unexpected system crashes.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public code: string = "DOMAIN_ERROR",
  ) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Thrown when a requested resource (Board, Lane, Card, User) does not exist.
 */
export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * Thrown when an operation violates a business invariant
 * (e.g., trying to delete the last remaining lane of a board if required).
 */
export class InvariantError extends DomainError {
  constructor(message: string) {
    super(message, "INVARIANT_VIOLATION");
    this.name = "InvariantError";
  }
}

/**
 * Thrown when user input fails domain validation rules.
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
