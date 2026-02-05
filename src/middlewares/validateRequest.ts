import { type NextFunction, type Request, type Response } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        status: 400,
        details: errors.array().map((error) => ({
          field: error.type === "field" ? error.path : undefined,
          message: error.msg,
        })),
      },
    });
    return;
  }

  next();
};
