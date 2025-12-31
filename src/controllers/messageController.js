import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createMessage = catchAsync(async (req, res, next) => {
  const { text, chatId, recipientId, itemId, file, fileName, fileSize, mimeType, messageType } =
    req.body;
  const senderId = req.user._id;
  let computedRecipientId;

  let chat;
  if (chatId) {
    chat = await Chat.findById(chatId);

    const otherUser = chat.userIds.find(user => {
      const id = user._id || user;
      return id.toString() !== senderId.toString();
    });
    computedRecipientId = recipientId || (otherUser?._id ? otherUser._id : otherUser);
  } else {
    chat = await Chat.findOne({ userIds: { $all: [senderId, recipientId], $size: 2 }, itemId });

    if (!chat) {
      chat = await Chat.create({ userIds: [senderId, recipientId], itemId });
    }
  }

  const isParticipant = chat.userIds.some(user => {
    const id = user._id || user;
    return id.toString() === senderId.toString();
  });

  if (!isParticipant) {
    return next(new AppError("You don't have access to this chat!", 403));
  }

  const message = await Message.create({
    chatId: chat._id,
    senderId,
    recipientId: computedRecipientId,
    text,
    file,
    messageType,
    fileName,
    mimeType,
    fileSize,
  });

  chat.lastMessage = message._id;
  await chat.save();

  await message.populate("senderId");
  await message.populate("recipientId");

  res.status(201).json({
    status: "success",
    data: { message },
  });
});

export const getChatMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ chatId }).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const total = await Message.countDocuments({ chatId });

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    },
  });
});

export const markAsRead = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message.seen) {
    message.seen = true;
    message.seenAt = Date.now();
    await message.save();
  }

  res.status(200).json({
    status: "success",
    message: "Message marked as read!",
    data: { message },
  });
});

export const editMessage = catchAsync(async (req, res, next) => {
  const { newText } = req.body;
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  message.text = newText;
  message.isEdited = true;
  message.updatedAt = Date.now();
  await message.save();

  res.status(202).json({
    status: "success",
    message: "Message updated successfully!",
    data: { message },
  });
});

export const deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  const chat = await Chat.findById(message.chatId);

  await message.deleteOne();

  if (chat.lastMessage === message._id) {
    const lastMsg = await Message.findOne({ chatId: message.chatId }).sort({ createdAt: -1 });

    chat.lastMessage = lastMsg?._id || null;
    await chat.save();
  }

  res.status(204).json({
    status: "success",
    message: "Message deleted successfully!",
    data: null,
  });
});
