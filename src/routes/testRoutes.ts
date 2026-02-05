import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";

const router = Router();

router.get("/admin-only", requireAuth, requireRole("admin"), (_req, res) => {
  res.json({ success: true, data: { message: "admin access granted" } });
});

export default router;
