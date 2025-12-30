import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
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
    content: {
      type: String,
      trim: true,
    },
    file: String,
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "application"],
      default: "text",
    },
    fileName: String,
    mimeType: String,
    fileSize: Number,
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: Date,
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
    toObject: {
      versionKey: false,
    },
  }
);

messageSchema.index({ chatId: 1, seen: 1, senderId: 1 });
messageSchema.index({ chatId: 1, createdAt: -1 });

messageSchema.pre(/^find/, function () {
  this.populate("senderId").populate("recipientId");
});

const Message = model("Message", messageSchema);

export default Message;
