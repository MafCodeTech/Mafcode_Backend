import requestModel from "../models/requestModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

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
  const requests = await requestModel
    .find({ isDeleted: false })
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
