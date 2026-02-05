import { body, param, query } from "express-validator";

export const createExperienceValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("start_time").isISO8601().withMessage("start_time must be a valid ISO date"),
  body("end_time").isISO8601().withMessage("end_time must be a valid ISO date"),
];

export const experienceIdParamValidator = [
  param("id").isInt({ gt: 0 }).withMessage("Experience id must be a positive integer"),
];

export const listExperiencesValidator = [
  query("location").optional().isString().withMessage("location must be a string"),
  query("start_date").optional().isISO8601().withMessage("start_date must be a valid ISO date"),
  query("end_date").optional().isISO8601().withMessage("end_date must be a valid ISO date"),
  query("page").optional().isInt({ gt: 0 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ gt: 0 }).withMessage("limit must be a positive integer"),
  query("sort").optional().isIn(["start_time", "-start_time"]).withMessage("Invalid sort value"),
];
