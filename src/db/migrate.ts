import { readFile } from "fs/promises";
import path from "path";
import { pool } from "./index";

const runMigration = async (): Promise<void> => {
  const schemaPath = path.join(__dirname, "schema.sql");

  try {
    console.log("Running database migration...");
    const schema = await readFile(schemaPath, "utf8");
    await pool.query(schema);
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed.", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

void runMigration();
