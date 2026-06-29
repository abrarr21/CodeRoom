import { createApp } from "./src/app.js";
import env from "./src/config/env.js";
import http from "http";
import { connectDatabase } from "./src/config/db.js";
import { attachSocketHandlers } from "./src/socket/handler.js";

await connectDatabase(env.mongoUri);

const app = createApp();
const httpServer = http.createServer(app);

attachSocketHandlers(httpServer);

httpServer
  .listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  })