import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Chat must have sender id"],
    },

    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Chat must have recipient id"],
    },

    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Chat must have item id"],
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: { createdAt: true },
  }
);

const Chat = model("Chat", chatSchema);

export default Chat;
