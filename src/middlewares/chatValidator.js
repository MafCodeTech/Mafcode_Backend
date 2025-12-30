import mongoose from "mongoose";

import Chat from "../models/chatModel.js";
import Item from "../models/itemModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync.js";

export const validateCreateChat = catchAsync(async (req, res, next) => {
  const { recipientId, itemId } = req.body;

  if (!recipientId || !itemId) {
    return next(new AppError("Recipient Id and itemId is required!", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    return next(new AppError("Invalid recipientId!", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new AppError("Invalid itemId!", 400));
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(new AppError("No User found!", 404));
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("No item found!", 404));
  }

  next();
});

export const validateGetChat = catchAsync(async (req, res, next) => {
  const { chatId, recipientId, itemId } = req.body;

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

  next();
});

export const validateGetUserItemChats = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  if (!itemId) {
    return next(new AppError("itemId is required!", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new AppError("Invalid itemId!", 400));
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("No item found!", 404));
  }

  next();
});

export const validateDeleteChat = catchAsync(async (req, res, next) => {
  const { chatId, recipientId, itemId } = req.body;

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

  next();
});
