const mongoose = require("mongoose");

const AiCamera = mongoose.Schema({
  cameraid: {
    type: String,
    required: [true, "Please Enter camera Id"],
  },
  ai_name:{
    type: String,
    required: [true, "Please Enter Ai"],
  },
  customerid: {
    type: String,
    required: [true, "Please Enter  customer Id"],
  },
  request_date: {
    type: Date,
    default: Date.now,
  },
  activation_date: {
    type: Date,
    default: null,
  },
  deactivation_date: {
    type: Date,
    default: null,
  },
  ai_status: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Boolean,
  },
  rtmp:{
    type:String
  },
  live_status:{
    type:Boolean,
    default:false,
  },
  selectedCamerastream:{
    type:String
  }
}, { collection: 'AiCamera' });

module.exports = mongoose.model("AiCamera", AiCamera);