import { Router } from "express";
import {
  blockExperience,
  createExperience,
  listExperiences,
  publishExperience,
} from "../controllers/experienceController";
import { requireAuth } from "../middlewares/auth";
import { requireOwnerOrAdmin, requireRole } from "../middlewares/rbac";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createExperienceValidator,
  experienceIdParamValidator,
  listExperiencesValidator,
} from "../validators/experienceValidators";

const router = Router();

router.get("/", listExperiencesValidator, validateRequest, listExperiences);
router.post(
  "/",
  requireAuth,
  requireRole("host"),
  createExperienceValidator,
  validateRequest,
  createExperience
);
router.patch(
  "/:id/publish",
  requireAuth,
  requireOwnerOrAdmin("experience"),
  experienceIdParamValidator,
  validateRequest,
  publishExperience
);
router.patch(
  "/:id/block",
  requireAuth,
  requireRole("admin"),
  experienceIdParamValidator,
  validateRequest,
  blockExperience
);

export default router;
