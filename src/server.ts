import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
