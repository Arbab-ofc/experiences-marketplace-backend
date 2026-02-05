import { query, pool } from "./index";
import { hashPassword } from "../utils/auth";
import type { UserRole } from "../types";

interface SeedUser {
  id: number;
  email: string;
  role: UserRole;
}

interface SeedExperience {
  id: number;
  host_id: number;
}

const ensureUser = async (email: string, role: UserRole, passwordHash: string): Promise<SeedUser> => {
  const result = await query<SeedUser>(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role RETURNING id, email, role",
    [email, passwordHash, role]
  );

  return result.rows[0];
};

const ensureExperience = async (hostId: number): Promise<SeedExperience> => {
  const existing = await query<SeedExperience>(
    "SELECT id, host_id FROM experiences WHERE host_id = $1 AND title = $2",
    [hostId, "Cooking Class"]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    return existing.rows[0];
  }

  const startTime = new Date("2026-03-01T10:00:00Z");
  const endTime = new Date("2026-03-01T13:00:00Z");

  const result = await query<SeedExperience>(
    "INSERT INTO experiences (host_id, title, description, location, price, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'published') RETURNING id, host_id",
    [hostId, "Cooking Class", "Learn Italian cooking", "Rome", 50, startTime, endTime]
  );

  return result.rows[0];
};

const ensureBooking = async (userId: number, experienceId: number): Promise<void> => {
  const existing = await query<{ id: number }>(
    "SELECT id FROM bookings WHERE user_id = $1 AND experience_id = $2",
    [userId, experienceId]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    return;
  }

  await query("INSERT INTO bookings (user_id, experience_id, status) VALUES ($1, $2, 'confirmed')", [
    userId,
    experienceId,
  ]);
};

const seed = async (): Promise<void> => {
  try {
    console.log("Seeding database...");

    const passwordHash = await hashPassword("Test1234");

    const admin = await ensureUser("admin@test.com", "admin", passwordHash);
    const host = await ensureUser("host@test.com", "host", passwordHash);
    const user = await ensureUser("user@test.com", "user", passwordHash);

    const experience = await ensureExperience(host.id);
    await ensureBooking(user.id, experience.id);

    console.log("Seed complete", { admin, host, user, experience });
  } catch (err) {
    console.error("Seed failed", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

void seed();
