import { Router } from "express";
import {
  blockExperience,
  createExperience,
  listExperiences,
  publishExperience,
} from "../controllers/experienceController";
import { requireAuth } from "../middlewares/auth";
import { requireOwnerOrAdmin, requireRole } from "../middlewares/rbac";

const router = Router();

router.get("/", listExperiences);
router.post("/", requireAuth, requireRole("host"), createExperience);
router.patch("/:id/publish", requireAuth, requireOwnerOrAdmin("experience"), publishExperience);
router.patch("/:id/block", requireAuth, requireRole("admin"), blockExperience);

export default router;
