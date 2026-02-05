import { param } from "express-validator";

export const bookingCreateValidator = [
  param("id").isInt({ gt: 0 }).withMessage("Experience id must be a positive integer"),
];
