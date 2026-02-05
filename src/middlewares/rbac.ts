import { type NextFunction, type Request, type Response } from "express";
import { query } from "../db";
import type { UserRole } from "../types";

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { message: "Forbidden", status: 403 } });
      return;
    }

    next();
  };
};

type ExperienceResource = {
  id: number;
  host_id: number;
};

type ResourceType = "experience";

export const requireOwnerOrAdmin = (resourceType: ResourceType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
      return;
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid resource id", status: 400 } });
      return;
    }

    if (resourceType === "experience") {
      const result = await query<ExperienceResource>("SELECT id, host_id FROM experiences WHERE id = $1", [id]);
      const resource = result.rows[0];

      if (!resource) {
        res.status(404).json({ success: false, error: { message: "Resource not found", status: 404 } });
        return;
      }

      if (req.user.role !== "admin" && req.user.id !== resource.host_id) {
        res.status(403).json({ success: false, error: { message: "Forbidden", status: 403 } });
        return;
      }

      req.resource = resource;
      next();
      return;
    }

    res.status(400).json({ success: false, error: { message: "Invalid resource type", status: 400 } });
  };
};
