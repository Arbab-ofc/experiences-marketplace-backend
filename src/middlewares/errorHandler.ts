import { type NextFunction, type Request, type Response } from "express";

interface HttpError extends Error {
  status?: number;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const error = err as HttpError;
  const status = error.status ?? 500;
  const message = error.message || "Internal Server Error";
  const isDev = process.env.NODE_ENV !== "production";

  res.status(status).json({
    success: false,
    error: {
      message,
      status,
      ...(isDev ? { stack: error.stack } : {}),
    },
  });
};
