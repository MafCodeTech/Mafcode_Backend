import { Router } from "express";

import { protect } from "../controllers/authController.js";
import * as chatController from "../controllers/chatController.js";
import * as chatValidator from "../middlewares/chatValidator.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(chatController.getUserChats)
  .post(chatValidator.validateCreateChat, chatController.createChat)
  .delete(chatValidator.validateDeleteChat, chatController.deleteChat);

router.post("/get-chat", chatValidator.validateGetChat, chatController.getChat);
router.get("/:itemId", chatValidator.validateGetUserItemChats, chatController.getUserItemChats);

export default router;
