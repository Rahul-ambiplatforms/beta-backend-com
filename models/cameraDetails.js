const mongoose = require("mongoose");

const cameraDetails = mongoose.Schema({
  id: {
    type: Number,
  },
  cameraid: {
    type: String,
    required: [true, "Please Enter camera Id"],
  },
  customerid: {
    type: String,
    required: [true, "Please Enter  customer Id"],
  },
  name: {
    type: String,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  device_id: {
    type: String,
    default: '',
  },
  urlid: {
    type: mongoose.Schema.Types.Mixed,
    default: NaN,
  },
  cvrplanid: {
    type: mongoose.Schema.Types.Mixed,
    default: NaN,
  },
  subid: {
    type: Number,
    default: null,
  },
  lag: {
    type: mongoose.Schema.Types.Mixed,
    default: NaN,
  },
  lat: {
    type: mongoose.Schema.Types.Mixed,
    default: NaN,
  },
  branch_id: {
    type: String,
    default: '',
  },
  isptz: {
    type: Number,
    default: 0,
  },
  isfhd: {
    type: Number,
    default: 0,
  },
}, { collection: 'CameraDetails' });

module.exports = mongoose.model("cameraDetails", cameraDetails);