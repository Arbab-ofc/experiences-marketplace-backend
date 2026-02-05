import type { QueryResult, QueryResultRow } from "pg";
import type { Request } from "express";
import {
  createExperience,
  publishExperience,
  blockExperience,
} from "../src/controllers/experienceController";
import { requireOwnerOrAdmin } from "../src/middlewares/rbac";
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

describe("Experiences Controller", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it("create experience as host", async () => {
    mockedQuery.mockResolvedValueOnce(
      makeQueryResult([
        {
          id: 1,
          host_id: 1,
          title: "Cooking Class",
          description: "Learn",
          location: "Rome",
          price: "50.00",
          start_time: new Date("2026-03-01T10:00:00Z"),
          end_time: new Date("2026-03-01T13:00:00Z"),
          status: "draft",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
    );

    const req = {
      user: { id: 1, email: "host@test.com", role: "host" },
      body: {
        title: "Cooking Class",
        description: "Learn",
        location: "Rome",
        price: 50,
        start_time: "2026-03-01T10:00:00Z",
        end_time: "2026-03-01T13:00:00Z",
      },
    } as Request;
    const res = createMockResponse();
    const next = createNext();

    await createExperience(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("create experience as user should fail", async () => {
    const req = {
      user: { id: 2, email: "user@test.com", role: "user" },
      body: {
        title: "Cooking Class",
        description: "Learn",
        location: "Rome",
        price: 50,
        start_time: "2026-03-01T10:00:00Z",
        end_time: "2026-03-01T13:00:00Z",
      },
    } as Request;
    const res = createMockResponse();
    const next = createNext();

    await createExperience(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("publish experience as owner", async () => {
    mockedQuery
      .mockResolvedValueOnce(makeQueryResult([{ id: 1, host_id: 1 }]))
      .mockResolvedValueOnce(makeQueryResult([{ id: 1, status: "draft" }]))
      .mockResolvedValueOnce(
        makeQueryResult([
          {
            id: 1,
            host_id: 1,
            title: "Cooking Class",
            description: "Learn",
            location: "Rome",
            price: "50.00",
            start_time: new Date("2026-03-01T10:00:00Z"),
            end_time: new Date("2026-03-01T13:00:00Z"),
            status: "published",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
      );

    const req = {
      user: { id: 1, email: "host@test.com", role: "host" },
      params: { id: "1" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = createNext();

    await runMiddleware(requireOwnerOrAdmin("experience"), req, res, next);
    await publishExperience(req, res, next);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
  });

  it("block experience as admin", async () => {
    mockedQuery.mockResolvedValueOnce(
      makeQueryResult([
        {
          id: 2,
          host_id: 1,
          title: "Cooking Class",
          description: "Learn",
          location: "Rome",
          price: "50.00",
          start_time: new Date("2026-03-01T10:00:00Z"),
          end_time: new Date("2026-03-01T13:00:00Z"),
          status: "blocked",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
    );

    const req = {
      user: { id: 3, email: "admin@test.com", role: "admin" },
      params: { id: "2" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = createNext();

    await blockExperience(req, res, next);

    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalled();
  });
});
