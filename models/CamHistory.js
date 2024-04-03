const mongoose = require("mongoose");

const CamHistory = mongoose.Schema({
  Id: {
    type: Number,
  },
  ActionID: {
    type: Number,
  },
  Actions: {
    type: String
  },
  ActionDetails: {
    type: String,
  },
  CreatedTime: {
    type: String,
  },
  IPAddress: {
    type: String,
  },
  Username: {
    type: String,
  },
  EmailId: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  IsVerified: {
    type: mongoose.Schema.Types.Mixed,
    default: NaN
  },
  IsActive: {
    type: mongoose.Schema.Types.Mixed,
    default: NaN
  },
  DeviceID: {
    type: String,
    default: ''
  },
  ServerURL: {
    type: String,
    default: ''
  },
  CVRPlan: {
    type: String,
    default: ''
  },
  PlanDays: {
    type: String ,
    default: ''
  },
  PageFrom: {
    type: String,
    default: ''
  }
}, { collection: 'CamHistory' });

module.exports = mongoose.model("CamHistory", CamHistory);
