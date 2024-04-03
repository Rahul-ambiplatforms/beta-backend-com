const express = require("express");
const {
  getAllCameras,getmultiplepage,
  addCamera,addAiCamera,active_ai,getAiCamera,
  getSettings,updateCameraname,DeleteSharedCamera,
  getShareCameras,Plans,deleteProduct,ShareThisCamera
} = require("../controllers/cameraController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(isAuthenticatedUser,getAllCameras);
router.route("/sharecamera").get(getShareCameras);
router.route("/sharethiscam").post(ShareThisCamera);
router.route("/deletesharedcam").get(DeleteSharedCamera);

//for user
router.route("/addcamera").post(isAuthenticatedUser,addCamera);
router.route("/deletecamera").delete(isAuthenticatedUser,deleteProduct);
router.route("/updatecameraname").post(isAuthenticatedUser,updateCameraname);

//for AI
router.route("/addAicamera").post(addAiCamera);
router.route("/getAicamera").get(getAiCamera);
router.route("/getmultiple").get(getmultiplepage);


module.exports = router;
