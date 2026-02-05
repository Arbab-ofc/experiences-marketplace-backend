import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["PORT", "DATABASE_URL", "JWT_SECRET", "NODE_ENV"] as const;

type NodeEnv = "development" | "test" | "production";

const missingVars = requiredVars.filter((key) => {
  const value = process.env[key];
  return !value || value.trim() === "";
});

if (missingVars.length > 0) {
  const message = `Missing required environment variables: ${missingVars.join(", ")}`;
  console.error(message);
  process.exit(1);
}

const port = Number(process.env.PORT);
if (Number.isNaN(port)) {
  console.error("Invalid PORT. Must be a number.");
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV as NodeEnv;
const allowedEnvs: NodeEnv[] = ["development", "test", "production"];
if (!allowedEnvs.includes(nodeEnv)) {
  console.error(`Invalid NODE_ENV. Must be one of: ${allowedEnvs.join(", ")}.`);
  process.exit(1);
}

export const config = {
  port,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  nodeEnv,
};
