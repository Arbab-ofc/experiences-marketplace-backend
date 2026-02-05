import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import type { JWTPayload } from "../types";

const SALT_ROUNDS = 10;

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

const verifyToken = async (token: string): Promise<JWTPayload> => {
  return jwt.verify(token, config.jwtSecret) as JWTPayload;
};

export { hashPassword, verifyPassword, generateToken, verifyToken };
