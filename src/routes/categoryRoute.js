import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import * as authController from "../controllers/authController.js";
const router = express.Router();
router.use(authController.protect);
router.use(authController.restrictTo("super-admin"));
router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);
router
  .route("/:id")
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);
export default router;
