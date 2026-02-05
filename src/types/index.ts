export type UserRole = "user" | "host" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  password_hash?: string;
}

export type ExperienceStatus = "draft" | "published" | "blocked";

export interface Experience {
  id: number;
  host_id: number;
  title: string;
  description: string | null;
  location: string;
  price: string;
  start_time: Date;
  end_time: Date;
  status: ExperienceStatus;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: number;
  role: UserRole;
}
