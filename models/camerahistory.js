const mongoose = require("mongoose");

const camerahistory = mongoose.Schema({
  id: {
    type: Number,
  },
  email: {
    type: String,
  },
  device_id: {
    type: String
  },
  serverurl: {
    type: String,
  },
  streamname: {
    type: String,
  },
  create_camera: {
    type: String,
  },
  delete_camera: {
    type: String,
  },
  IPAddress: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { collection: 'camerahistory' });

module.exports = mongoose.model("camerahistory", camerahistory);
