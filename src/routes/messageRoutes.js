import { Router } from "express";

import { protect } from "../controllers/authController.js";
import * as messageController from "../controllers/messageController.js";
import * as messageValidator from "../middlewares/messageValidator.js";
import { processMessageFile, uploadFile } from "../services/fileUploader.js";

const router = Router();

router.use(protect);

router.post("/", messageValidator.validateCreateMessage, messageController.createMessage);
router.post(
  "/media",
  uploadFile,
  processMessageFile,
  messageValidator.validateCreateMessage,
  messageController.createMessage
);
router.get("/:chatId", messageValidator.validateGetChatMessages, messageController.getChatMessages);
router.patch("/:messageId/read", messageValidator.validateMarkAsRead, messageController.markAsRead);
router
  .route("/:messageId")
  .patch(messageValidator.validateEditMessage, messageController.editMessage)
  .delete(messageValidator.validateDeleteMessage, messageController.deleteMessage);

export default router;
