const mongoose = require("mongoose");
const uuid = require('uuid');
const uuidString = uuid.v4(); // Generate a UUID as a string
// Insert uuidString into MongoDB

const CVRPlan = mongoose.Schema({
    id: {
        type: Number,
    },
    plan_name: {
        type: String,
    },
    Serverid: {
        type: Number,
    },
    plandetail: {
        type: String,
        default: null,
    },
    plandays: {
        type: Number,
        default: null,
    },
    isenable: {
        type: Number,
        default: 0,
    },
    price: {
        type: mongoose.Schema.Types.Mixed,
        default: NaN,
    },
}, { collection: 'CVRPlan' });

module.exports = mongoose.model("CVRPlan", CVRPlan);
