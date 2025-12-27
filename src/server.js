import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";

import app from "./app.js";
import initSocket from "./socket.js";

dotenv.config();
const DB_URI = process.env.DATABASE_URL;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(error => console.log("database error", error.message));

const port = process.env.PORT || 9000;

const server = http.createServer(app);

// Initialize Socket.IO handlers
initSocket(server);

server.listen(port, () => {
  console.log("Server is running on port " + port);
});
