import { Router } from "express";
import * as itemController from "../controllers/itemController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(
    itemController.uploadItemImage,
    itemController.resizeImage,
    itemController.createItem
  )
  .get(itemController.getAllItems);

router.route("/my-items").get(itemController.getAllItemsForUSer);
router
  .route("/status")
  .get(restrictTo("admin", "super-admin"), itemController.getItemsByStatus);
router
  .route("/:id")
  .get(itemController.getItem)
  .patch(itemController.updateItem)
  .delete(itemController.deleteItem);

export default router;
