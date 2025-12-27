import Place from "../models/placesModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const addPlace = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  const place = await Place.create({
    name,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: {
      place,
    },
  });
});

export const getPlaces = catchAsync(async (req, res, next) => {
  const places = await Place.find({ status: "active" });

  res.status(200).json({
    status: "success",
    results: places.length,
    data: {
      places,
    },
  });
});

export const getPlaceById = catchAsync(async (req, res, next) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return next(new AppError("No place found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      place,
    },
  });
});

export const updatePlace = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  const place = await Place.findByIdAndUpdate(
    req.params.id,
    { name, description, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!place) {
    return next(new AppError("No place found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      place,
    },
  });
});

export const deletePlace = catchAsync(async (req, res, next) => {
  const place = await Place.findByIdAndUpdate(
    req.params.id,
    { status: "inactive", updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!place) {
    return next(new AppError("No place found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

export const assignAdminsToPlace = catchAsync(async (req, res, next) => {
  const { adminId } = req.body;

  const place = await Place.findById(req.params.id);

  if (!place) {
    return next(new AppError("No place found with that ID", 404));
  }

  place.admins = adminId;
  await place.save();

  res.status(200).json({
    status: "success",
    data: {
      place,
    },
  });
});

export const removeAdminFromPlace = catchAsync(async (req, res, next) => {
  const { adminId } = req.body;

  const place = await Place.findById(req.params.id);

  if (!place) {
    return next(new AppError("No place found with that ID", 404));
  }

  place.admins.pull(adminId);
  await place.save();

  res.status(200).json({
    status: "success",
    data: {
      place,
    },
  });
});
