import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import { promisify } from "util";
import AppError from "../utils/appError.js";
import dotenv from "dotenv";
import QRCode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcrypt"

dotenv.config();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signUp = catchAsync(async (req, res) => {
  // Create the user first
  const newUser = await User.create(req.body);

  // Generate a QR code containing the user's unique _id
  const qrData = newUser._id.toString();
  const qrCodeUrl = await QRCode.toDataURL(qrData);

  // Save the QR code URL to the user profile
  newUser.qrCode = qrCodeUrl;
  await newUser.save({ validateBeforeSave: false });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("user not found ", 404));
  }
  const hashedCode = crypto.createHash("sha256").update(otp).digest("hex");
  if (
    user.verificationCode !== hashedCode ||
    user.verificationCodeExpires < Date.now()
  ) {
    return next(new AppError("Invalid or expired OTP.", 400));
  }
  res.status(200).json({
    status: "success",
    message: "otp verified successfully",
  });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  const verificationCode = user.createVerificationCode();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Verification code sent to email!",
    // code: verificationCode, // In production, do not send the code in the response
  });
});
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  } else {
    cookieOptions.secure = false;
  }

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  return res.status(statusCode).json({
    status: "success",
    token,
  });
};

export const resetPassword = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(AppError("user not found", 404));
  }
  const hashedCode = crypto.createHash("sha256").update(otp).digest("hex");
  if (
    hashedCode !== user.verificationCode ||
    user.verificationCodeExpires < Date.now()
  ) {
    return next(new AppError("Invalid or expired OTP", 400));
  }
  user.password = password;
  user.passwordConfirm = confirmPassword;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async(req,res,next)=>{
  const user = await User.findById(req.user.id).select("+password")

  if(!(await bcrypt.compare(req.body.currentPassword,user.password))){
    return next (new AppError("your current password isn't correct",401))
  }
  user.password = req.body.newPassword
  user.confirmPassword = req.body.confirmPassword
  await user.save()
  createSendToken(user,200, res)
})