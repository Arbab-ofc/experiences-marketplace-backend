import { type NextFunction, type Request, type Response } from "express";
import type { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import type { DatabaseError } from "pg";

interface HttpError extends Error {
  status?: number;
}

const isDatabaseError = (error: unknown): error is DatabaseError => {
  return typeof error === "object" && error !== null && "code" in error;
};

const isJwtError = (error: unknown): error is JsonWebTokenError | TokenExpiredError => {
  return typeof error === "object" && error !== null && "name" in error && "message" in error;
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDatabaseError(err)) {
    const error = err as DatabaseError;
    if (error.code === "23505") {
      res.status(409).json({
        success: false,
        error: {
          message: "Duplicate key value violates unique constraint",
          status: 409,
          ...(isDev ? { stack: error.stack } : {}),
        },
      });
      return;
    }

    if (error.code === "23503") {
      res.status(400).json({
        success: false,
        error: {
          message: "Foreign key constraint violation",
          status: 400,
          ...(isDev ? { stack: error.stack } : {}),
        },
      });
      return;
    }
  }

  if (isJwtError(err)) {
    res.status(401).json({
      success: false,
      error: {
        message: "Invalid or expired token",
        status: 401,
        ...(isDev ? { stack: (err as Error).stack } : {}),
      },
    });
    return;
  }

  const error = err as HttpError;
  const status = error.status ?? 500;
  const message = error.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    error: {
      message,
      status,
      ...(isDev ? { stack: error.stack } : {}),
    },
  });
};
