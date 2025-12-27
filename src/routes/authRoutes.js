import express from "express";

import * as authController from "../controllers/authController.js";
import { resizeUserPhoto, uploadUserPhoto } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", uploadUserPhoto, resizeUserPhoto, authController.signUp);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/forget-password", authController.forgetPassword);
router.patch("/reset-password", authController.resetPassword);
router.patch("/update-password", authController.protect, authController.updatePassword);
export default router;
