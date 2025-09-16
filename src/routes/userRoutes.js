import express from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(authController.restrictTo("super-admin"), userController.getAllUsers);
router.route("/getMe").get(userController.getMe, userController.getUser);

router
  .route("/updateMe")
  .patch(userController.getMe, userController.updateUser);

router
  .route("/deleteMe")
  .delete(userController.getMe, userController.deleteUser);

router.route("/user-info-visibility").patch(userController.updateVisibility);

router.route("/qrCode").get(userController.getUserByQRCode);

router.use(authController.restrictTo("super-admin"));
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
