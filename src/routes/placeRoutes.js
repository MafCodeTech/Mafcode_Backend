import express from "express";
import * as placeController from "../controllers/placesController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("super Admin"),
    placeController.addPlace
  )
  .get(placeController.getPlaces);

router
  .route("/:id")
  .get(placeController.getPlaceById)
  .patch(authController.protect, placeController.updatePlace)
  .delete(authController.protect, placeController.deletePlace);

export default router;
