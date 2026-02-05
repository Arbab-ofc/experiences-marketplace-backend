import type { QueryResult, QueryResultRow } from "pg";
import type { Request } from "express";
import { requireRole, requireOwnerOrAdmin } from "../src/middlewares/rbac";
import * as db from "../src/db";
import { createMockResponse, createNext, runMiddleware } from "./testUtils";

jest.mock("../src/db", () => ({
  query: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue(true),
}));

const makeQueryResult = <T extends QueryResultRow>(rows: T[]): QueryResult<T> => {
  return { rows, rowCount: rows.length } as QueryResult<T>;
};

const mockedQuery = db.query as jest.MockedFunction<typeof db.query>;

describe("RBAC Middleware", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it("allows admin access", async () => {
    const req = { user: { id: 10, email: "admin@test.com", role: "admin" } } as Request;
    const res = createMockResponse();
    const next = createNext();

    await runMiddleware(requireRole("admin"), req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("blocks non-admin access", async () => {
    const req = { user: { id: 11, email: "user@test.com", role: "user" } } as Request;
    const res = createMockResponse();
    const next = createNext();

    await runMiddleware(requireRole("admin"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("blocks non-owner non-admin on experience", async () => {
    mockedQuery.mockResolvedValueOnce(makeQueryResult([{ id: 1, host_id: 99 }]));

    const req = {
      user: { id: 20, email: "host@test.com", role: "host" },
      params: { id: "1" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = createNext();

    await runMiddleware(requireOwnerOrAdmin("experience"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
