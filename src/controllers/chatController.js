import Chat from "../models/chatModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createChat = catchAsync(async (req, res, next) => {
  const { recipientId, itemId } = req.body;
  const senderId = req.body.senderId || req.user._id;

  let chat = await Chat.findOne({ itemId, userIds: { $all: [senderId, recipientId], $size: 2 } });

  if (chat) {
    return res.status(200).json({
      status: "success",
      message: "Chat already exists",
      data: { chat },
    });
  }

  chat = await Chat.create({ userIds: [senderId, recipientId], itemId });

  res.status(201).json({
    status: "success",
    data: { chat },
  });
});

export const getChat = catchAsync(async (req, res, next) => {
  const { chatId, recipientId, itemId } = req.body;
  const senderId = req.user._id;

  let chat;

  if (chatId) {
    chat = await Chat.findById(chatId);
  } else {
    chat = await Chat.findOne({ userIds: { $all: [senderId, recipientId], $size: 2 }, itemId });
  }

  if (!chat) {
    return next(new AppError("No chat found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: { chat },
  });
});

export const getUserChats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await Chat.find({ userIds: { $in: userId } });

  res.status(200).json({
    status: "success",
    results: chats.length,
    data: { chats },
  });
});

export const getUserItemChats = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  const chats = await Chat.find({ userIds: { $in: userId }, itemId });

  res.status(200).json({
    status: "success",
    data: { chats },
  });
});

export const deleteChat = catchAsync(async (req, res, next) => {
  const { chatId, recipientId, itemId } = req.body;
  const userId = req.user._id;

  let chat;
  if (chatId) {
    chat = await Chat.findById(chatId);
  } else {
    chat = await Chat.findOne({ userIds: { $all: [userId, recipientId], $size: 2 }, itemId });
  }

  if (!chat) {
    return next(new AppError("No chat found!", 404));
  }

  await chat.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
