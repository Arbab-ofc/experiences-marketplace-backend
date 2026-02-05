import { Router } from "express";
import { createBooking, getUserBookings } from "../controllers/bookingController";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/rbac";

const router = Router();

router.post("/experiences/:id/book", requireAuth, requireRole("user"), createBooking);
router.get("/bookings", requireAuth, getUserBookings);

export default router;
