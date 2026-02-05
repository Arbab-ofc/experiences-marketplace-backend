export type UserRole = "user" | "host" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  password_hash?: string;
}

export interface JWTPayload {
  userId: number;
  role: UserRole;
}
