const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    uri: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    coverImage: {
        type: String,
        default: "",
    },
    duration: {
        type: Number,
        default: 0,
    },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "album",
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const musicModel = mongoose.model("music", musicSchema);

module.exports = musicModel;
