const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const userModel = require("../models/user.model");
const { uploadFile } = require('../services/storage.service');

async function createMusic(req, res) {
    const { title, albumId, duration, coverImage: coverImageUrl } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    let musicFile = null;
    let coverFile = null;

    if (req.files) {
        if (req.files.music && req.files.music[0]) {
            musicFile = req.files.music[0];
        }
        if (req.files.cover && req.files.cover[0]) {
            coverFile = req.files.cover[0];
        }
    } else if (req.file) {
        musicFile = req.file;
    }

    if (!musicFile) {
        return res.status(400).json({ message: "No music audio file uploaded" });
    }

    try {
        // Upload audio file
        const audioUploadResult = await uploadFile(
            musicFile.buffer.toString('base64'),
            "music_" + Date.now() + ".mp3",
            "spotify_clone/music"
        );

        let finalCoverImage = coverImageUrl || "";
        if (coverFile) {
            const coverUploadResult = await uploadFile(
                coverFile.buffer.toString('base64'),
                "cover_" + Date.now() + ".jpg",
                "spotify_clone/covers"
            );
            finalCoverImage = coverUploadResult.url;
        }

        const music = await musicModel.create({
            uri: audioUploadResult.url,
            title,
            artist: req.user.id,
            coverImage: finalCoverImage,
            duration: duration ? Number(duration) : 0,
            album: albumId || null,
        });

        // If an album was specified, associate the music with that album
        if (albumId) {
            await albumModel.findByIdAndUpdate(albumId, {
                $addToSet: { musics: music._id }
            });
        }

        res.status(201).json({
            message: "Music created successfully",
            music: {
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist,
                coverImage: music.coverImage,
                duration: music.duration,
                album: music.album,
            },
        });
    } catch (error) {
        console.error("createMusic error:", error);
        res.status(500).json({
            message: "Failed to create music",
            error: error.message,
        });
    }
}

async function createAlbum(req, res) {
    try {
        const { title, description, coverImage, musics } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Album title is required" });
        }

        let albumCover = coverImage || "";
        if (req.file) {
            const coverResult = await uploadFile(
                req.file.buffer.toString('base64'),
                "album_" + Date.now() + ".jpg",
                "spotify_clone/albums"
            );
            albumCover = coverResult.url;
        }

        const album = await albumModel.create({
            title,
            description: description || "",
            coverImage: albumCover,
            artist: req.user.id,
            musics: musics || [],
        });

        // If songs were provided, update those songs to reference this album
        if (musics && musics.length > 0) {
            await musicModel.updateMany(
                { _id: { $in: musics } },
                { $set: { album: album._id } }
            );
        }

        res.status(201).json({
            message: "Album created successfully",
            album: {
                id: album._id,
                title: album.title,
                description: album.description,
                coverImage: album.coverImage,
                artist: album.artist,
                musics: album.musics,
            },
        });
    } catch (err) {
        console.error("createAlbum error:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message,
        });
    }
}

async function getAllMusics(req, res) {
    try {
        const { search, artist, album, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }
        if (artist) {
            filter.artist = artist;
        }
        if (album) {
            filter.album = album;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [musics, total] = await Promise.all([
            musicModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("artist", "username email")
                .populate("album", "title coverImage"),
            musicModel.countDocuments(filter)
        ]);

        res.status(200).json({
            message: "Musics fetched successfully",
            total,
            page: Number(page),
            musics,
        });
    } catch (err) {
        console.error("getAllMusics error:", err);
        res.status(500).json({
            message: "Failed to fetch musics",
            error: err.message,
        });
    }
}

async function getAllAlbums(req, res) {
    try {
        const { search } = req.query;
        const filter = {};
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        const albums = await albumModel
            .find(filter)
            .sort({ createdAt: -1 })
            .populate("artist", "username email")
            .populate("musics", "title uri coverImage duration");

        res.status(200).json({
            message: "Albums fetched successfully",
            albums,
        });
    } catch (err) {
        console.error("getAllAlbums error:", err);
        res.status(500).json({
            message: "Failed to fetch albums",
            error: err.message,
        });
    }
}

async function getAlbumById(req, res) {
    try {
        const { albumId } = req.params;

        const album = await albumModel
            .findById(albumId)
            .populate("artist", "username email")
            .populate({
                path: "musics",
                populate: { path: "artist", select: "username email" }
            });

        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        return res.status(200).json({
            message: "Album fetched successfully",
            album,
        });
    } catch (err) {
        console.error("getAlbumById error:", err);
        res.status(500).json({
            message: "Failed to fetch album",
            error: err.message,
        });
    }
}

async function searchAll(req, res) {
    try {
        const query = req.query.q || req.query.search || "";
        if (!query.trim()) {
            return res.status(200).json({ musics: [], albums: [], artists: [] });
        }

        const regex = { $regex: query, $options: "i" };

        const [musics, albums, artists] = await Promise.all([
            musicModel.find({ title: regex }).populate("artist", "username").populate("album", "title coverImage").limit(20),
            albumModel.find({ title: regex }).populate("artist", "username").populate("musics", "title uri").limit(10),
            userModel.find({ username: regex, role: "artist" }).select("username role").limit(10)
        ]);

        res.status(200).json({
            message: "Search results",
            query,
            musics,
            albums,
            artists
        });
    } catch (err) {
        console.error("searchAll error:", err);
        res.status(500).json({
            message: "Search failed",
            error: err.message
        });
    }
}

async function toggleLikeMusic(req, res) {
    try {
        const { musicId } = req.params;
        const userId = req.user.id;

        const music = await musicModel.findById(musicId);
        if (!music) {
            return res.status(404).json({ message: "Music track not found" });
        }

        const user = await userModel.findById(userId);
        const alreadyLiked = user.likedMusics.some(id => id.toString() === musicId);

        if (alreadyLiked) {
            await userModel.findByIdAndUpdate(userId, {
                $pull: { likedMusics: musicId }
            });
            return res.status(200).json({
                message: "Track removed from Liked Songs",
                isLiked: false,
                musicId
            });
        } else {
            await userModel.findByIdAndUpdate(userId, {
                $addToSet: { likedMusics: musicId }
            });
            return res.status(200).json({
                message: "Track added to Liked Songs",
                isLiked: true,
                musicId
            });
        }
    } catch (err) {
        console.error("toggleLikeMusic error:", err);
        res.status(500).json({
            message: "Failed to toggle like",
            error: err.message
        });
    }
}

async function getLikedMusics(req, res) {
    try {
        const user = await userModel.findById(req.user.id).populate({
            path: "likedMusics",
            populate: [
                { path: "artist", select: "username email" },
                { path: "album", select: "title coverImage" }
            ]
        });

        res.status(200).json({
            message: "Liked songs fetched successfully",
            musics: user.likedMusics || []
        });
    } catch (err) {
        console.error("getLikedMusics error:", err);
        res.status(500).json({
            message: "Failed to fetch liked songs",
            error: err.message
        });
    }
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getAllAlbums,
    getAlbumById,
    searchAll,
    toggleLikeMusic,
    getLikedMusics
};



