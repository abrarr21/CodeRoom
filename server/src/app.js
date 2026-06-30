import cors from "cors";
import express from "express";
import env from "./config/env.js";
import roomRoutes from "./routes/room.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl.split(",").map((origin) => origin.trim()) }));
  app.use(express.json());

  app.use("/api/rooms", roomRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(status).json({
      success: false,
      error: message,
    });
  });

  return app;
}
