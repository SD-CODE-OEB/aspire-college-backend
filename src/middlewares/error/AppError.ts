/**
 * Simple custom error class for beginners
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - for bad requests
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Not Found Error - for missing resources
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Database Error - for DB related issues
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database error") {
    super(message, 500);
  }
}

/**
 * Authorization Error - for permission issues
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Not authorized") {
    super(message, 403);
  }
}
