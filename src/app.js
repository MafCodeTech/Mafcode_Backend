import express from "express";
import cors from "cors";
import morgan from "morgan";
import AppError from "./utils/appError.js";
import authRoutes from "./routes/authRoutes.js";
import globalErrorHandler from "./controllers/errorController.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import requestRoutes from "./routes/requestRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
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

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
