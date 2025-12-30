import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const createMessage = catchAsync(async (req, res, next) => {
  const { content, chatId, recipientId, itemId, file, fileName, fileSize, mimeType, messageType } =
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
    content,
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
