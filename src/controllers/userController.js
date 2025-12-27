import cloudinary from "cloudinary";
import multer from "multer";
import sharp from "sharp";
import stream from "stream";

import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

export const uploadUserPhoto = upload.single("profilePicture");

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${Date.now()}.jpeg`;

  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();

  // Use a PassThrough stream to upload the image buffer to Cloudinary
  const uploadStream = cloudinary.v2.uploader.upload_stream(
    { folder: "users", public_id: req.file.filename },
    (error, result) => {
      if (error) {
        return next(new AppError("Error uploading image to Cloudinary", 500));
      }

      req.body.profilePicture = result.secure_url;
      next();
    }
  );

  // Pipe the processed image buffer to Cloudinary's upload stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);
  bufferStream.pipe(uploadStream);
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getAllUsers = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  const users = await User.find({ active: true, role: "user" }).skip(skip).limit(limit);

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "phone",
    " profilePicture",
    "showEmail",
    "showPhoneNumber",
    "showImage"
  );
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// get user using qr code
export const getUserByQRCode = catchAsync(async (req, res, next) => {
  const { qrCode } = req.body;
  const user = await User.findOne({ qrCode, active: true });

  if (!user) {
    return next(new AppError("User not found with that QR code", 404));
  }

  // const publicUser = {
  //   id: user.id,
  //   name: user.name,
  //   // qrCode: user.qrCode,

  //   // if user.showEmail is true, include email in the response
  //   ...(user.showEmail && { email: user.email }),
  //   ...(user.showPhoneNumber && { phoneNumber: user.phoneNumber }),
  //   ...(user.showImage && { profilePicture: user.profilePicture }),
  // };

  res.status(200).json({
    status: "success",
    data: user,
  });
});

// export const updateVisibility = catchAsync(async (req, res, next) => {
//   const { showEmail, showPhoneNumber, showImage } = req.body;

//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       ...(showEmail !== undefined && { showEmail }),
//       ...(showPhoneNumber !== undefined && { showPhoneNumber }),
//       ...(showImage !== undefined && { showImage }),
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!updatedUser) {
//     return next(new AppError("User not found", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       user: updatedUser,
//     },
//   });
// });
