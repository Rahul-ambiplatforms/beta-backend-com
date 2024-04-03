const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
  cameraid: String,
  customerid: String,
  cameraname: String,
  cameraurl: String,
  createdDate: Date,
  deviceid: String,
  is360: Boolean,
  isfhd: Boolean,
  islive: Number,
  isnumplate: Boolean,
  isptz: Boolean,
  plandays: Number,
  plandisplayname: String,
  planname: String,
  streamname: [String],
});

const Camera = mongoose.model('Camera', cameraSchema);

module.exports = Camera;
