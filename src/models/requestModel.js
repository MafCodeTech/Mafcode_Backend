import mongoose, { model } from "mongoose";
const requestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Status is required"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    Image: {
      type: String,
      // required: [true, "Image is required"],
      trim: true,
    },
    color: {
      type: String,
    },
    brand: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      // required: [true, "Location is required"],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;
