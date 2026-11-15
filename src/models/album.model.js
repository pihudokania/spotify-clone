

const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    coverImage: {
        type: String,
        default: "",
    },
    musics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "music"
    }],
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const albumModel = mongoose.model("album", albumSchema);

module.exports = albumModel;