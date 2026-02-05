import type { Request, Response, NextFunction } from "express";

type Middleware = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export const createMockResponse = (): Response => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
};

export const createNext = (): NextFunction => jest.fn();

export const runMiddleware = async (
  middleware: Middleware,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await middleware(req, res, next);
};
