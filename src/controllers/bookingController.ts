import { type NextFunction, type Request, type Response } from "express";
import { query } from "../db";
import type { Booking, BookingStatus, Experience, UserRole } from "../types";

const isUser = (role?: UserRole): boolean => role === "user";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !isUser(req.user.role)) {
      res.status(403).json({ success: false, error: { message: "Forbidden", status: 403 } });
      return;
    }

    const experienceId = Number(req.params.id);
    if (Number.isNaN(experienceId)) {
      res.status(400).json({ success: false, error: { message: "Invalid experience id", status: 400 } });
      return;
    }

    const experienceResult = await query<Experience>(
      "SELECT id, status FROM experiences WHERE id = $1",
      [experienceId]
    );
    const experience = experienceResult.rows[0];

    if (!experience) {
      res.status(404).json({ success: false, error: { message: "Experience not found", status: 404 } });
      return;
    }

    if (experience.status !== "published") {
      res.status(409).json({
        success: false,
        error: { message: "Experience is not available for booking", status: 409 },
      });
      return;
    }

    const duplicate = await query<{ id: number }>(
      "SELECT id FROM bookings WHERE user_id = $1 AND experience_id = $2",
      [req.user.id, experienceId]
    );

    if (duplicate.rowCount && duplicate.rowCount > 0) {
      res.status(409).json({
        success: false,
        error: { message: "Booking already exists", status: 409 },
      });
      return;
    }

    const result = await query<Booking>(
      "INSERT INTO bookings (user_id, experience_id, status) VALUES ($1, $2, $3) RETURNING *",
      [req.user.id, experienceId, "confirmed" as BookingStatus]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
      return;
    }

    const result = await query<
      Booking & {
        experience_title: string;
        experience_location: string;
        experience_start_time: Date;
        experience_end_time: Date;
      }
    >(
      "SELECT b.*, e.title AS experience_title, e.location AS experience_location, e.start_time AS experience_start_time, e.end_time AS experience_end_time FROM bookings b JOIN experiences e ON b.experience_id = e.id WHERE b.user_id = $1 ORDER BY b.created_at DESC",
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
