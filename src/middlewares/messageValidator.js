import mongoose from "mongoose";

import Chat from "../models/chatModel.js";
import Item from "../models/itemModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// This needs more improvements for the messageType and
export const validateCreateMessage = catchAsync(async (req, res, next) => {
  const { text, chatId, recipientId, itemId, file, fileName, fileSize, mimeType, messageType } =
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

    if (item.createdBy.toString() !== recipient._id.toString()) {
      return next(new AppError("This item is not created by this recipient!", 400));
    }
  }

  if (!file && (!text || !text.trim())) {
    return next(new AppError("Message text cannot be empty!", 400));
  } else {
    if (
      typeof text !== "string" ||
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

export const validateGetChatMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.body;

  if (!chatId) {
    return next(new AppError("You must enter chatId!", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return next(new AppError("Invalid chatId!", 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("No chat found with this chatId!", 404));
  }

  next();
});

export const validateMarkAsRead = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  if (!messageId) {
    return next(new AppError("You must enter messageId", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return next(new AppError("Invalid messageId!", 400));
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("No message found with this messageId", 404));
  }

  if (message.recipientId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only mark message sent to you as read!", 403));
  }

  next();
});

export const validateEditMessage = catchAsync(async (req, res, next) => {
  const { newText } = req.body;
  const { messageId } = req.params;

  if (!newText || !newText.trim() || !messageId) {
    return next(new AppError("You must enter newText and messageId", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return next(new AppError("Invalid messageId!", 400));
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("No message found!", 404));
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only edit your own messages!", 403));
  }

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    return next(new AppError("Cannot edit messages older than 15 minutes", 400));
  }

  next();
});

export const validateDeleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  if (!messageId) {
    return next(new AppError("You must provide messageId", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return next(new AppError("Invalid messageId!", 400));
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("No message found!", 404));
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only delete your own messages", 403));
  }

  next();
});
