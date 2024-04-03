// routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/settingController');

// Custom middleware function
function customMiddleware(req, res, next) {
  // You can perform any operations here
  console.log('Settings Middleware Calling');
  next(); // Call next() to continue to the next middleware or route handler
}

// Define a route for your proxy with custom middleware
router.post('/get', customMiddleware, SettingController.getsetting);
router.post('/set', customMiddleware, SettingController.setsetting);

module.exports = router;
