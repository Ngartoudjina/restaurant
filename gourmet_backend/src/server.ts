//src/server.ts

import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import app from "./app";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("✅ Serveur démarré");
  console.log(`🌍 ENV: ${process.env.NODE_ENV}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error("❌ Server error:", error);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM reçu, fermeture...");
  server.close(() => {
    console.log("Serveur fermé");
    process.exit(0);
  });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
