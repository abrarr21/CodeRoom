import cors from "cors";
import express from "express";
import env from "./config/env.js";
import roomRoutes from "./routes/room.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl }));
  app.use(express.json());

  app.use("/api/rooms", roomRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    const isDuplicateKey = err?.code === 11000;
    const status = isDuplicateKey ? 409 : err.status || err.statusCode || 500;
    const message = isDuplicateKey
      ? "Room code already exists. Please try again."
      : err.message || "Internal server error";

    res.status(status).json({
      success: false,
      error: message,
    });
  });

  return app;
}
