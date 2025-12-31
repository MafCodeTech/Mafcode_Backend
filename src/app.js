import cors from "cors";
import express from "express";
import morgan from "morgan";

import globalErrorHandler from "./controllers/errorController.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import AppError from "./utils/appError.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("./public"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/places", placeRoutes);
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/chat", chatRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
