import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/userModel.js";
import Message from "./models/messageModel.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Map of userId => socketId
  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Authentication error'));
      socket.userId = user._id.toString();
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      console.log(`User ${socket.userId} connected (socket ${socket.id})`);
    } else {
      console.log(`Unauthenticated socket connected: ${socket.id}`);
    }

    socket.on('private_message', async (payload, ack) => {
      try {
        if (!socket.userId) return ack && ack({ error: 'Not authenticated' });
        const { to, content } = payload;
        if (!to || !content) return ack && ack({ error: 'Invalid payload' });

        const message = await Message.create({ sender: socket.userId, recipient: to, content });

        const recipientSocketId = onlineUsers.get(to);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('private_message', {
            _id: message._id,
            sender: message.sender,
            recipient: message.recipient,
            content: message.content,
            createdAt: message.createdAt,
          });
        }

        ack && ack({ status: 'ok', message: {
          _id: message._id,
          sender: message.sender,
          recipient: message.recipient,
          content: message.content,
          createdAt: message.createdAt,
        }});
      } catch (err) {
        console.error('private_message error', err);
        ack && ack({ error: 'Could not send message' });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });

  return io;
}

export default initSocket;
