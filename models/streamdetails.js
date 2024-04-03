const mongoose = require("mongoose");
// Insert uuidString into MongoDB

const streamdetailsSchema = mongoose.Schema({
    id: {
        type: Number,
    },
    cameraid: {
        type: String,
        required: [true, "Please Enter camera Id"],
    },
    streamname: {
        type: String,
    },
    status: {
        type: Number,
        default: 0,
    },
    StatusDate: {
        type: Date,
        default: null,
    },
    alertDate: {
        type: Date,
        default: null,
    },
}, { collection: 'streamdetails' });

module.exports = mongoose.model("streamdetails", streamdetailsSchema);
