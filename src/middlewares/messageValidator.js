import mongoose from "mongoose";

import Chat from "../models/chatModel.js";
import Item from "../models/itemModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// This needs more improvements for the messageType and
export const validateCreateMessage = catchAsync(async (req, res, next) => {
  const { content, chatId, recipientId, itemId, file, fileName, fileSize, mimeType, messageType } =
    req.body;

  if (!chatId && (!recipientId || !itemId)) {
    return next(new AppError("You must enter either chatId or recipientId and itemId.", 400));
  }

  if (chatId) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return next(new AppError("Invalid chatId!", 400));
    }
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return next(new AppError("No chat found!", 404));
    }
  } else {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return next(new AppError("Invalid recipientId!", 400));
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return next(new AppError("Invalid itemId!", 400));
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(new AppError("No user found!", 404));
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return next(new AppError("No item found!", 404));
    }
  }

  if (!file && (!content || !content.trim())) {
    return next(new AppError("Message content cannot be empty!", 400));
  } else {
    if (
      typeof file !== "string" ||
      typeof fileName !== "string" ||
      typeof fileSize !== "number" ||
      typeof mimeType !== "string" ||
      typeof messageType !== "string"
    ) {
      return next(new AppError("Invalid types of data!", 400));
    }
  }

  next();
});
