import { Router, type Request, type Response } from "express";
import { checkConnection } from "../db";
import authRoutes from "./authRoutes";

const router = Router();

router.get("/health", async (_req: Request, res: Response) => {
  const isConnected = await checkConnection();

  if (!isConnected) {
    res.status(503).json({ status: "error", database: "disconnected" });
    return;
  }

  res.json({ status: "ok", database: "connected", timestamp: Date.now() });
});

router.use("/auth", authRoutes);

export default router;
