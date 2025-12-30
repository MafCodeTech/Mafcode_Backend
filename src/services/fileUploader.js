import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import multer from "multer";
import stream from "stream";

import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file) {
    cb(null, true);
  } else {
    cb(new AppError("No file found!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

export const uploadFile = upload.single("file");

export const processMessageFile = catchAsync((req, res, next) => {
  try {
    const file = req.file;
    const messageType = req.body.messageType || file.mimetype.split("/")[0];

    if (!file) {
      return next(new AppError("No file uploaded", 400));
    }

    let folder = "chat/";
    let resourceType = "auto";

    switch (messageType) {
      case "image":
        folder += "image";
        resourceType = "image";
        break;
      case "video":
        folder += "video";
        resourceType = "video";
        break;
      case "audio":
        folder += "audio";
        resourceType = "video"; // Cloudinary uses video for audio
        break;
      case "application":
        folder += "application";
        resourceType = "raw";
        break;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return next(new AppError(error.message || "Error upload file to cloudinary", 500));
        }

        req.body.file = result.secure_url;
        req.body.fileName = file.originalname;
        req.body.fileSize = file.size;
        req.body.mimeType = file.mimetype;
        req.body.messageType = file.mimetype.split("/")[0];

        next();
      }
    );

    const bufferStream = new stream.PassThrough();
    uploadStream.end(file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    next(new AppError(error.message || "Error processing file", 500));
  }
});
