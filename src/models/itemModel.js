import mongoose from "mongoose";
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    qrCode: {
      type: String,
      trim: true,
      unique: true,
    },
    qrLinked: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },
    Image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  }
);

itemSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "name email phoneNumber profilePicture ",
  }).populate({
    path: "category",
    select: "name",
  });
  next();
});

const Item = mongoose.model("Item", itemSchema);
export default Item;
