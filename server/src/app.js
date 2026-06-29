import cors from "cors";
import express from "express";
import {attachSocketHandlers} from "./socket/handler.js";
import env from "./config/env.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl }));
  app.use(express.json());


  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
