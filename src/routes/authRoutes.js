import express from "express";
import * as authController from "../controllers/authController.js";
import {
  uploadUserPhoto,
  resizeUserPhoto,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", uploadUserPhoto, resizeUserPhoto, authController.signUp);
router.post("/login", authController.login);
export default router;
