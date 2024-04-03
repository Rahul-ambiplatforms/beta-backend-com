const mongoose = require("mongoose");

const cameraList = mongoose.Schema({
  id: {
    type: Number,
  },
  cameraID: {
    type: String,
  },
  isvalid: {
    type: Number,
    default: 1,
  },
  isptz: {
    type: Number,
    default: 0,
  },
  isfhd: {
    type: Number,
    default: 0,
  },
  isnumplate: {
    type: mongoose.Schema.Types.Mixed,
    default: NaN
  },
  is360: {
    type: Number,
    default: 0,
  },
  ProUrl: {
    type: String,
    default: 'tcp://pro.ambicam.com:1883',
  },
}, { collection: 'CameraList' });

module.exports = mongoose.model("cameraList", cameraList);
