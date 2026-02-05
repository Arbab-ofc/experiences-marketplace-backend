import { Pool, type QueryResult } from "pg";
import { config } from "../config/env";

const pool = new Pool({
  connectionString: config.databaseUrl,
});

type QueryParam = string | number | boolean | null | Date;
type QueryParams = QueryParam[];

const query = <T>(text: string, params?: QueryParams): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

const testConnection = async (): Promise<void> => {
  await pool.query("SELECT 1");
};

const checkConnection = async (): Promise<boolean> => {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};

export { pool, query, testConnection, checkConnection };
