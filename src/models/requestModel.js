import mongoose, { model } from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["lost", "found", "recovered"],
      required: [true, "Status is required"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    Image: [
      {
        type: String,
      },
    ],
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
      required: [true, "Location is required"],
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
    lostDate: {
      type: Date,
      required: function () {
        return this.status === "lost";
      },
    },
    foundDate: {
      type: Date,
      required: function () {
        return this.status === "found";
      },
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

requestSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "name email phoneNumber profilePicture",
  }).populate({
    path: "category",
    select: "name",
  });
  next();
});

const Request = mongoose.model("Request", requestSchema);
export default Request;
