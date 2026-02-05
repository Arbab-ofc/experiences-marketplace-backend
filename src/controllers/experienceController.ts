import { type NextFunction, type Request, type Response } from "express";
import { query } from "../db";
import type { Experience, UserRole } from "../types";

type ExperienceInput = {
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  start_time?: string;
  end_time?: string;
};

const isHost = (role?: UserRole): boolean => role === "host";

export const createExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !isHost(req.user.role)) {
      res.status(403).json({ success: false, error: { message: "Forbidden", status: 403 } });
      return;
    }

    const { title, description, location, price, start_time, end_time } = req.body as ExperienceInput;

    const startDate = new Date(start_time as string);
    const endDate = new Date(end_time as string);

    if (endDate <= startDate) {
      res.status(400).json({
        success: false,
        error: { message: "end_time must be after start_time", status: 400 },
      });
      return;
    }

    const result = await query<Experience>(
      "INSERT INTO experiences (host_id, title, description, location, price, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft') RETURNING *",
      [req.user.id, title, description ?? null, location, price, startDate, endDate]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const publishExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
      return;
    }

    if (req.user.role === "admin" && req.resource && req.resource.host_id !== req.user.id) {
      res.status(403).json({ success: false, error: { message: "Forbidden", status: 403 } });
      return;
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid id", status: 400 } });
      return;
    }

    const current = await query<Experience>(
      "SELECT id, status FROM experiences WHERE id = $1",
      [id]
    );

    const experience = current.rows[0];
    if (!experience) {
      res.status(404).json({ success: false, error: { message: "Experience not found", status: 404 } });
      return;
    }

    if (experience.status !== "draft") {
      res.status(409).json({
        success: false,
        error: { message: "Only draft experiences can be published", status: 409 },
      });
      return;
    }

    const updated = await query<Experience>(
      "UPDATE experiences SET status = 'published', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    res.json({ success: true, data: updated.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const blockExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid id", status: 400 } });
      return;
    }

    const updated = await query<Experience>(
      "UPDATE experiences SET status = 'blocked', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    const experience = updated.rows[0];
    if (!experience) {
      res.status(404).json({ success: false, error: { message: "Experience not found", status: 404 } });
      return;
    }

    res.json({ success: true, data: experience });
  } catch (err) {
    next(err);
  }
};

export const listExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { location, start_date, end_date, page, limit, sort } = req.query as Record<
      string,
      string | undefined
    >;

    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 10;
    const sanitizedPage = Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
    const sanitizedLimit = Number.isNaN(limitNumber) || limitNumber < 1 ? 10 : limitNumber;

    const sortValue = sort === "-start_time" ? "DESC" : "ASC";

    const filters: string[] = ["status = 'published'"];
    const params: Array<string | number> = [];

    if (location) {
      params.push(`%${location}%`);
      filters.push(`location ILIKE $${params.length}`);
    }

    if (start_date) {
      params.push(start_date);
      filters.push(`start_time >= $${params.length}`);
    }

    if (end_date) {
      params.push(end_date);
      filters.push(`start_time <= $${params.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM experiences ${whereClause}`,
      params
    );
    const total = Number(countResult.rows[0]?.count ?? 0);

    params.push(sanitizedLimit);
    params.push((sanitizedPage - 1) * sanitizedLimit);

    const listResult = await query<Experience>(
      `SELECT * FROM experiences ${whereClause} ORDER BY start_time ${sortValue} LIMIT $${
        params.length - 1
      } OFFSET $${params.length}`,
      params
    );

    res.json({
      success: true,
      data: {
        experiences: listResult.rows,
        pagination: { page: sanitizedPage, limit: sanitizedLimit, total },
      },
    });
  } catch (err) {
    next(err);
  }
};
