import type { QueryResult, QueryResultRow } from "pg";
import type { Request } from "express";
import { signup, login } from "../src/controllers/authController";
import * as db from "../src/db";
import * as auth from "../src/utils/auth";
import { createMockResponse, createNext } from "./testUtils";

jest.mock("../src/db", () => ({
  query: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock("../src/utils/auth", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

const makeQueryResult = <T extends QueryResultRow>(rows: T[]): QueryResult<T> => {
  return { rows, rowCount: rows.length } as QueryResult<T>;
};

const mockedQuery = db.query as jest.MockedFunction<typeof db.query>;
const mockedHashPassword = auth.hashPassword as jest.MockedFunction<typeof auth.hashPassword>;
const mockedVerifyPassword = auth.verifyPassword as jest.MockedFunction<typeof auth.verifyPassword>;
const mockedGenerateToken = auth.generateToken as jest.MockedFunction<typeof auth.generateToken>;

describe("Auth Controller", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    mockedHashPassword.mockReset();
    mockedVerifyPassword.mockReset();
    mockedGenerateToken.mockReset();
  });

  it("signup success", async () => {
    mockedQuery
      .mockResolvedValueOnce(makeQueryResult([]))
      .mockResolvedValueOnce(
        makeQueryResult([{ id: 1, email: "user@test.com", role: "user" }])
      );
    mockedHashPassword.mockResolvedValue("hashed");

    const req = {
      body: { email: "user@test.com", password: "Test1234", role: "user" },
    } as Request;
    const res = createMockResponse();
    const next = createNext();

    await signup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("signup duplicate email", async () => {
    mockedQuery.mockResolvedValueOnce(makeQueryResult([{ id: 1 }]));

    const req = {
      body: { email: "user@test.com", password: "Test1234", role: "user" },
    } as Request;
    const res = createMockResponse();
    const next = createNext();

    await signup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("login success", async () => {
    mockedQuery.mockResolvedValueOnce(
      makeQueryResult([
        { id: 1, email: "user@test.com", role: "user", password_hash: "hash" },
      ])
    );
    mockedVerifyPassword.mockResolvedValue(true);
    mockedGenerateToken.mockReturnValue("token");

    const req = {
      body: { email: "user@test.com", password: "Test1234" },
    } as Request;
    const res = createMockResponse();
    const next = createNext();

    await login(req, res, next);

    expect(res.status).not.toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });

  it("login wrong password", async () => {
    mockedQuery.mockResolvedValueOnce(
      makeQueryResult([
        { id: 1, email: "user@test.com", role: "user", password_hash: "hash" },
      ])
    );
    mockedVerifyPassword.mockResolvedValue(false);

    const req = {
      body: { email: "user@test.com", password: "WrongPass1" },
    } as Request;
    const res = createMockResponse();
    const next = createNext();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
