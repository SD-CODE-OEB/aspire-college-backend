import { AppError } from "./AppError";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let message = err.message;
  let statusCode = 500;

  // If it's our custom error, use its status code
  if (err instanceof AppError) {
    statusCode = err.statusCode;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });

  // Log the error
  console.log(`Error: ${message}`);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export default errorHandler;
