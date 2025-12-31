import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { promisify } from "util";

import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import logger from "../utils/logger.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Map of userId => socketId
  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        logger.error("Unauthenticated socket connection!");
        return next(new AppError("Unauthenticated connection!", 401));
      }

      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      socket.userId = user._id.toString();
      return next();
    } catch (error) {
      logger.error(error.message || "Socket authentication error");
      return next(new AppError(error.message || "Authentication error", 401));
    }
  });

  io.on("connection", async socket => {
    onlineUsers.set(socket.userId, socket.id);
    logger.info(`User ${socket.userId} connected (socket ${socket.id})`);

    socket.join(socket.userId);
    logger.info(`Joined user room: ${socket.userId}`);

    try {
      await User.findByIdAndUpdate(socket.userId, { status: "online" });

      socket.broadcast.emit("user-status-changed", {
        userId: socket.userId,
        status: "online",
      });
    } catch (error) {
      logger.error("Failed to update user status", error);
    }

    logger.info(`Online users: ${onlineUsers.size}`);

    socket.on("join-chat", async chatId => {
      try {
        // check if chatId exists and is a valid mongoose ObjectId
        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
          socket.emit("error", { message: "Invalid chat ID" });
        }

        // check if the chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit("error", { message: "Chat not found" });
          return;
        }

        // Check if user is a participant
        const isParticipant = chat.userIds.some(userId => {
          const id = userId._id || userId; // Handle both populated and unpopulated
          return id.toString() === socket.userId;
        });

        if (!isParticipant) {
          socket.emit("error", { message: "You don't have access to this chat!" });
          return;
        }

        // Join the user to chat room
        socket.join(chatId);
        socket.emit("joined-chat", { chatId, success: true });

        logger.info(`User ${socket.userId} joined chat ${chatId}`);
      } catch (error) {
        logger.error("Error in 'join-chat': ", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    socket.on("leave-chat", chatId => {
      try {
        // check if chatId exists and is a valid mongoose ObjectId
        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
          socket.emit("error", { message: "Invalid chat ID" });
        }

        socket.leave(chatId);

        logger.info(`User ${socket.userId} leaved chat ${chatId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to leave chat" });
        logger.error("Failed to leave chat", error);
      }
    });

    // socket.on("private_message", async (payload, ack) => {
    //   try {
    //     if (!socket.userId) return ack && ack({ error: "Not authenticated" });
    //     const { to, content } = payload;
    //     if (!to || !content) return ack && ack({ error: "Invalid payload" });

    //     const message = await Message.create({ sender: socket.userId, recipient: to, content });

    //     const recipientSocketId = onlineUsers.get(to);
    //     if (recipientSocketId) {
    //       io.to(recipientSocketId).emit("private_message", {
    //         _id: message._id,
    //         sender: message.sender,
    //         recipient: message.recipient,
    //         content: message.content,
    //         createdAt: message.createdAt,
    //       });
    //     }

    //     ack &&
    //       ack({
    //         status: "ok",
    //         message: {
    //           _id: message._id,
    //           sender: message.sender,
    //           recipient: message.recipient,
    //           content: message.content,
    //           createdAt: message.createdAt,
    //         },
    //       });
    //   } catch (err) {
    //     console.error("private_message error", err);
    //     ack && ack({ error: "Could not send message" });
    //   }
    // });

    socket.on("disconnect", async reason => {
      try {
        onlineUsers.delete(socket.userId);
        logger.info(`User ${socket.userId} disconnected: ${reason}`);

        logger.info(`Online users: ${onlineUsers.size}`);

        await User.findByIdAndUpdate(socket.userId, { status: "Offline" });
        socket.broadcast.emit("user-status-changed", {
          userId: socket.userId,
          status: "offline",
        });
      } catch (error) {
        logger.error(error.message || "Socket disconnection error!");
      }
    });

    socket.on("error", error => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  return io;
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }

  return io;
};
