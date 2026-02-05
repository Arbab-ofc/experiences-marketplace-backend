import { config } from "./config/env";
import app from "./app";
import { testConnection } from "./db";

const startServer = async (): Promise<void> => {
  try {
    await testConnection();
    console.log("Database connected");

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close((err) => {
        if (err) {
          console.error("Error during server shutdown", err);
          process.exit(1);
        }
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Database connection failed", err);
    process.exit(1);
  }
};

void startServer();
