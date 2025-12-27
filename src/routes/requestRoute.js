import express from "express";

import * as authController from "../controllers/authController.js";
import * as requestController from "../controllers/requestController.js";

const router = express.Router();

router.use(authController.protect);
router
  .route("/")
  .get(requestController.getAllRequests)
  .post(
    requestController.uploadRequestImages,
    requestController.resizeRequestImages,
    requestController.createRequest
  );

router.route("/my-requests").get(requestController.getMyRequests);
router.route("/place/:id").get(requestController.getRequestByPlace);

router
  .route("/:id")
  .get(requestController.getRequestById)
  .delete(requestController.deleteRequest)
  .patch(requestController.updateRequest);
export default router;
