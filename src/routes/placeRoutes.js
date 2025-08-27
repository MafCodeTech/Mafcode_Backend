import express from "express";
import * as placeController from "../controllers/placesController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.use(authController.protect);
router
  .route("/")
  .post(authController.restrictTo("super Admin"), placeController.addPlace)
  .get(placeController.getPlaces);

router
  .route("/:id/admins")
  .post(
    authController.restrictTo("super-admin"),
    placeController.assignAdminsToPlace
  )
  .delete(
    authController.restrictTo("super-admin"),
    placeController.removeAdminFromPlace
  );

router
  .route("/:id")
  .get(placeController.getPlaceById)
  .patch(placeController.updatePlace)
  .delete(placeController.deletePlace);

export default router;
