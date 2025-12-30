import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    userIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Chat must have sender id"],
      },
    ],

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
    toJSON: {
      versionKey: false,
    },
    toObject: {
      versionKey: false,
    },
  }
);

chatSchema.index({ userIds: 1, itemId: 1 });

chatSchema.pre(/^find/, function () {
  this.populate("userIds").populate("itemId").populate("lastMessage");
});

const Chat = model("Chat", chatSchema);

export default Chat;
