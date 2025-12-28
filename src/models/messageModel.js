import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  message: {
    type: String,
    required: [true, "Message body is required"],
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Message must have sender id"],
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Message must have recipient id"],
  },
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
    required: [true, "Message must have chat id"],
  },
  seen: {
    type: Boolean,
    default: false,
  },
  seenAt: Date,

  isEdited: {
    type: Boolean,
    default: false,
  },

  editedAt: Date,
});

const Message = model("Message", messageSchema);

export default Message;
