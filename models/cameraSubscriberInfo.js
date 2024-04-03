const mongoose = require("mongoose");

const cameraSubscriberInfoSchema = mongoose.Schema({
    id: {
        type: Number,
    },
    subemail: {
        type: String,
        required: [true, "Please Enter camera Id"],
    },
    subdeviceid: {
        type: String,
        required: [true, "Please Enter subscribed device Id"],
    },
    issubscribe: {
        type: Number,
        default: 0,
    },
    subscriptiondate: {
        type: String,
        default: null,
    },
    cvrplanid: {
        type: Number,
        default: 0,
    },
    urlid: {
        type: Number,
        default: 0,
    },
    comment: {
        type: String,
        default: '',
    },
    lag: {
        type: mongoose.Schema.Types.Mixed,
        default: NaN,
    },
    lat: {
        type: mongoose.Schema.Types.Mixed,
        default: NaN,
    },
    plan_month: {
        type: Number,
        default: 0
    },
}, { collection: 'cameraSubscriberInfo' });

module.exports = mongoose.model("cameraSubscriberInfo", cameraSubscriberInfoSchema);
