const mongoose = require("mongoose");
const uuid = require('uuid');
const uuidString = uuid.v4(); // Generate a UUID as a string
// Insert uuidString into MongoDB

const url_list = mongoose.Schema({
    id: {
        type: Number,
    },
    streamurl: {
        type: String,
        required: [true, "Please Enter camera Id"],
    },
    username: {
        type: String,
        default: "demo"
    },
    password: {
        type: String,
        default: "demo"
    },
    sflag: {
        type: Number,
        default: 0,
    },
    isaws: {
        type: Number,
        default: 0,
    },
    isSecure: {
        type: Number,
        default: 0,
    },
}, { collection: 'url_list' });

module.exports = mongoose.model("url_list", url_list);
