const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
  activateUser,generateActivationCode
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");




router.route("/register").post(registerUser);

router.route("/resendotp").post(generateActivationCode);

router.route("/activate").put(activateUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);


// admin

router
  .route("/admin/users")
  .get( getAllUser);

router
  .route("/admin/user/:id")
  .get( getSingleUser)
  .put(updateUserRole)
  .delete(deleteUser);

module.exports = router;

