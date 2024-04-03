const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

const authorizationHeader = req.headers['authorization'];
if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
  return next(new ErrorHander("Please provide a valid 'Authorization' header", 401));
}

const token = authorizationHeader.replace('Bearer ', '');

  if (!token) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
  } catch (error) {
    return next(new ErrorHander("Invalid token or authorization", 401));
  }

});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};
