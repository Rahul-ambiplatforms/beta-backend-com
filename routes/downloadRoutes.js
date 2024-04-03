// routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const convertedController = require('../controllers/convertedController');
// Custom middleware function
function customMiddleware(req, res, next) {
  // You can perform any operations here
  console.log('Download Middleware Calling');
  next(); // Call next() to continue to the next middleware or route handler
}

// Define a route for your proxy with custom middleware
router.post('/download', customMiddleware, downloadController.downloadProxy);
router.get('/converted', customMiddleware, convertedController.downloadAndConvert);

module.exports = router;
