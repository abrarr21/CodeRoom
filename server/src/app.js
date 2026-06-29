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
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
