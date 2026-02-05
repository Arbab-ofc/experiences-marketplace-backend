import { type NextFunction, type Request, type Response } from "express";
import { query } from "../db";
import { verifyToken } from "../utils/auth";
import type { User } from "../types";

const getBearerToken = (header?: string): string | null => {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
      return;
    }

    const payload = await verifyToken(token);
    const result = await query<User>("SELECT id, email, role FROM users WHERE id = $1", [payload.userId]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
  }
};
