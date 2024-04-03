const express = require('express');
const multer = require('multer');
const router = express.Router();
const {getmodel,deploymodel,uploadmodel,updateStatus,getaicamera,
    createCamera,getUrllist, plans, updateUrls,updateProduct, getAllPlans,getAllCamera,updateCamera,loginAdmin,active_ai,
     deleteUrl, deletePlan, getPlanById,getTotalUser,getTotalCamera,camtouser,
     updatePlan, getAllStreamUrls,deleteProduct,getUsersCameras,searchUserCameras,addCamera, getLiveCameras
} = require("../controllers/adminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/adminlogin").post(loginAdmin);

router.route("/createcamera").post(createCamera);
router.route("/all/camera").get(getAllCamera);
router.route("/camtouser").post(camtouser);
router.route("/update/Camera").put(updateCamera);
router.route("/urls").get(getUrllist);
router.route("/plans").get(plans);
router.route("/getAllplans").get(getAllPlans);
router.route("/streamurls").get(getAllStreamUrls);
router.route("/updateurl/:id").put(updateUrls).delete(deleteUrl);
router.route("/updateplan/:id").get(getPlanById).put(updatePlan).delete(deletePlan);
router.route("/deletecamera/:id").delete(deleteProduct);
router.route("/all/userscamera").get(getUsersCameras);
router.route("/search/userscamera").get(searchUserCameras);
router.route("/totalUsers").get(getTotalUser);
router.route("/totalCameras").get(getTotalCamera);
router.route("/liveCameras").get(getLiveCameras);
router.route("/updateUsersCamera").put(updateProduct);
router.route("/addcamera").post(addCamera);

const upload = multer();
//for AI
router.route("/active_ai").post(active_ai);
router.route("/getmodel").get(getmodel);
router.route("/deploy").post(deploymodel);
router.route("/upload").post(upload.single('file'), uploadmodel);
router.route("/updateLiveStatus").post(updateStatus);
router.route("/getaicamera").get(getaicamera);

module.exports = router;

