import dotenv from "dotenv";
import http from "http";
import { connect } from "mongoose";

import app from "./app.js";
import { initSocket } from "./services/socket.js";
import logger from "./utils/logger.js";

dotenv.config();
const DB_URI = process.env.DATABASE_URL;
const port = process.env.PORT || 9000;

try {
  connect(DB_URI)
    .then(() => {
      logger.info("Connected to the database");
    })
    .catch(error => logger.error("database error", error.message));

  const server = http.createServer(app);

  // Initialize Socket.IO handlers
  initSocket(server);

  server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
} catch (error) {
  logger.error("Server startup error: ", error);
}
