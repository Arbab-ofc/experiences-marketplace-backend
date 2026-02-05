import { type NextFunction, type Request, type Response } from "express";
import { query } from "../db";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth";
import type { User, UserRole } from "../types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const isAllowedRole = (role: string): role is UserRole => {
  return role === "user" || role === "host";
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ success: false, error: { message: "Invalid email", status: 400 } });
      return;
    }

    if (!password || !passwordRegex.test(password)) {
      res.status(400).json({
        success: false,
        error: { message: "Password must be at least 8 chars, 1 uppercase, 1 number", status: 400 },
      });
      return;
    }

    if (!role || !isAllowedRole(role)) {
      res.status(400).json({ success: false, error: { message: "Invalid role", status: 400 } });
      return;
    }

    const existing = await query<{ id: number }>("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ success: false, error: { message: "Email already in use", status: 409 } });
      return;
    }

    const passwordHash = await hashPassword(password);
    const result = await query<User>(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, passwordHash, role]
    );

    const user = result.rows[0];
    res.status(201).json({ success: true, data: { userId: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ success: false, error: { message: "Email and password required", status: 400 } });
      return;
    }

    const result = await query<User>(
      "SELECT id, email, role, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    if (!user || !user.password_hash) {
      res.status(401).json({ success: false, error: { message: "Invalid credentials", status: 401 } });
      return;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, error: { message: "Invalid credentials", status: 401 } });
      return;
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
};
