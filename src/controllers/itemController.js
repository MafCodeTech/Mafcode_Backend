import Item from "../models/itemModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import cloudinary from "cloudinary";
import multer from "multer";
import sharp from "sharp";
import stream from "stream";

cloudinary.v2.config({
  cloud_name: "dffsykenb",
  api_key: "853689847542267",
  api_secret: "P7WLaUPKmz2mf1E95Jp30ISJqjg",
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadItemImage = upload.single("Image");

export const resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `item${req.user.id}-${Date.now()}.jpeg`;

  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();

  const uploadStream = cloudinary.v2.uploader.upload_stream(
    { folder: "items", public_id: req.file.filename },
    (error, result) => {
      if (error) {
        return next(new AppError("Error uploading image to Cloudinary", 500));
      }

      req.body.Image = result.secure_url;
      next();
    }
  );

  // Pipe the processed image buffer to Cloudinary's upload stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);
  bufferStream.pipe(uploadStream);
});

export const createItem = catchAsync(async (req, res, next) => {
  const { qrCode } = req.body;
  if (!qrCode) {
    return next(new AppError("QR code is required to create an item", 400));
  }

  // Check if QR code is already linked
  const existing = await Item.findOne({ qrCode });
  if (existing) {
    return next(
      new AppError("This QR code is already linked to another item", 400)
    );
  }

  const newItem = await Item.create({
    ...req.body,
    createdBy: req.user._id,
    qrLinked: true,
  });

  res.status(201).json({
    status: "success",
    message: "Item created and QR code linked successfully",
    data: {
      item: newItem,
    },
  });
});

export const getAllItemsForUSer = catchAsync(async (req, res) => {
  const items = await Item.find({ createdBy: req.user._id, active: true });
  res.status(200).json({
    status: "success",
    results: items.length,
    data: {
      items,
    },
  });
});

export const getAllItems = catchAsync(async (req, res) => {
  const items = await Item.find({ active: true });
  res.status(200).json({
    status: "success",
    results: items.length,
    data: {
      items,
    },
  });
});

export const getItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

export const updateItem = catchAsync(async (req, res, next) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

export const deleteItem = catchAsync(async (req, res, next) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
export const getItemsByType = catchAsync(async (req, res, next) => {
  const items = await Item.find({ type: req.body.type });
  if (items.length === 0) {
    return next(new AppError("No items found for this type", 404));
  }
  res.status(200).json({
    status: "success",
    results: items.length,
    data: {
      items,
    },
  });
});

export const getItemsByStatus = catchAsync(async (req, res, next) => {
  const items = await Item.aggregate([
    {
      $group: {
        _id: "null",
        totalItems: { $sum: 1 },
        lost: { $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] } },
        found: { $sum: { $cond: [{ $eq: ["$status", "found"] }, 1, 0] } },
        recovered: {
          $sum: { $cond: [{ $eq: ["$status", "recovered"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  if (!items) {
    return next(new AppError("No items found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      items,
    },
  });
});

// // Link a hard copy QR code to an item (owner only, first scan)
// export const linkQrCodeToItem = catchAsync(async (req, res, next) => {
//   const { itemId, qrCode } = req.body;
//   if (!itemId || !qrCode) {
//     return next(new AppError("itemId and qrCode are required", 400));
//   }

//   // Find the item and check ownership
//   const item = await Item.findById(itemId);
//   if (!item) {
//     return next(new AppError("Item not found", 404));
//   }
//   if (!item.createdBy.equals(req.user._id)) {
//     return next(new AppError("You are not the owner of this item", 403));
//   }
//   if (item.qrLinked) {
//     return next(new AppError("QR code already linked to this item", 400));
//   }

//   // Check if QR code is already linked to another item
//   const existing = await Item.findOne({ qrCode });
//   if (existing) {
//     return next(
//       new AppError("This QR code is already linked to another item", 400)
//     );
//   }

//   item.qrCode = qrCode;
//   item.qrLinked = true;
//   await item.save();

//   res.status(200).json({
//     status: "success",
//     message: "QR code linked to item successfully",
//     data: { item },
//   });
// });

// Get item info by QR code (public)
export const getItemByQrCode = catchAsync(async (req, res, next) => {
  const { qrCode } = req.params;
  const item = await Item.findOne({
    qrCode,
    qrLinked: true,
    active: true,
  });
  if (!item) {
    return next(new AppError("No item found for this QR code", 404));
  }
  res.status(200).json({
    status: "success",
    data: { item },
  });
});
