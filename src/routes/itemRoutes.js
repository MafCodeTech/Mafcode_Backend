import { Router } from "express";
import * as itemController from "../controllers/itemController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(itemController.createItem)
  .get(itemController.getAllItems);

router.route("/my-items").get(itemController.getAllItemsForUSer);
router.route("/status").get(itemController.getItemsByStatus);
router
  .route("/:id")
  .get(itemController.getItem)
  .patch(restrictTo("admin"), itemController.updateItem)
  .delete(restrictTo("admin"), itemController.deleteItem);

export default router;
