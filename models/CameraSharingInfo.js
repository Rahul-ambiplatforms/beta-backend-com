const mongoose = require('mongoose');

// Define the schema for your data
const cameraSharingInfo = new mongoose.Schema({
  id: {
    type: Number,
  },
  cameraid: {
    type: String,
    required: true,
  },
  customerid: {
    type: String,
    required: true,
  },
  receiveremail: {
    type: String,
    required: true,
  },
  subscribercode: {
    type: String,
    required: true,
  },
  _isallow:{
    type:Number,
    default:0
  },
}, { collection: 'CameraSharingInfo' });


// Create the MongoDB model
module.exports = mongoose.model('cameraSharingInfo', cameraSharingInfo);