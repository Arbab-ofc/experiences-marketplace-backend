import { Router } from "express";
import { createBooking, getUserBookings } from "../controllers/bookingController";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";
import { validateRequest } from "../middlewares/validateRequest";
import { bookingCreateValidator } from "../validators/bookingValidators";

const router = Router();

router.post(
  "/experiences/:id/book",
  requireAuth,
  requireRole("user"),
  bookingCreateValidator,
  validateRequest,
  createBooking
);
router.get("/bookings", requireAuth, getUserBookings);

export default router;
