import requestModel from "../models/requestModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import cloudinary from "cloudinary";
import sharp from "sharp";
import multer from "multer";
import stream from "stream";
import APIFeatures from "../utils/apiFeatures.js";

cloudinary.v2.config({
  cloud_name: "dffsykenb",
  api_key: "853689847542267",
  api_secret: "P7WLaUPKmz2mf1E95Jp30ISJqjg",
});

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadRequestImages = upload.fields([
  { name: "Image", maxCount: 3 },
]);
// upload it on cloudinary
export const resizeRequestImages = catchAsync(async (req, res, next) => {
  if (!req.files.Image) return next();
  const imagePromises = req.files.Image.map(async (file) => {
    const filename = `request-${req.user.id}-${Date.now()}.jpeg`;

    // 1. Process image
    const buffer = await sharp(file.buffer)
      .resize(800, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    // 2. Wrap Cloudinary upload in a Promise
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: "requests", public_id: filename },
        (error, result) => {
          if (error) {
            return reject(
              new AppError("Error uploading image to Cloudinary", 500)
            );
          }
          resolve(result.secure_url);
        }
      );

      // Pipe buffer to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    });
  });
  // 3. Wait for all uploads
  const uploadedImages = await Promise.all(imagePromises);

  // 4. Store results
  req.body.Image = uploadedImages;

  // 5. Continue
  next();
});

export const createRequest = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    brand,
    serialNumber,
    location,
    Image,
    color,
    status,
    model,
    lostDate,
    foundDate,
    category,
  } = req.body;

  const request = await requestModel.create({
    title,
    description,
    brand,
    serialNumber,
    location,
    Image,
    color,
    status,
    model,
    lostDate,
    foundDate,
    category,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: {
      request,
    },
  });
});

export const getAllRequests = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    requestModel.find({ isDeleted: false }).populate("createdBy").populate("location"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const requests = await features.query;
  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});


export const getRequestById = catchAsync(async (req, res, next) => {
  const request = await requestModel
    .findById(req.params.id)
    .populate("createdBy")
    .populate("location");

  if (!request) {
    return next(new AppError("No request found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      request,
    },
  });
});

export const updateRequest = catchAsync(async (req, res, next) => {
  const request = await requestModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!request) {
    return next(new AppError("No request found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      request,
    },
  });
});

export const deleteRequest = catchAsync(async (req, res, next) => {
  const request = await requestModel.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    {
      new: true,
    }
  );

  if (!request) {
    return next(new AppError("No request found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
export const getMyRequests = catchAsync(async (req, res, next) => {
  const requests = await requestModel
    .find({ createdBy: req.user._id, isDeleted: false })
    .populate("createdBy")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});

export const getRequestByPlace = catchAsync(async (req, res, next) => {
  const requests = await requestModel
    .find( { location: req.params.id, isDeleted: false } )
    .populate("createdBy")
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});
