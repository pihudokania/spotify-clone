const express = require("express");
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const uploadMusicFiles = upload.fields([
    { name: "music", maxCount: 1 },
    { name: "cover", maxCount: 1 }
]);

const router = express.Router();

// Artist routes
router.post("/upload", authMiddleware.authArtist, uploadMusicFiles, musicController.createMusic);
router.post("/album", authMiddleware.authArtist, upload.single("cover"), musicController.createAlbum);

// General authenticated browse routes
router.get("/", authMiddleware.authUser, musicController.getAllMusics);
router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums);
router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAlbumById);
router.get("/search", authMiddleware.authUser, musicController.searchAll);

// User Liked tracks routes
router.post("/like/:musicId", authMiddleware.authUser, musicController.toggleLikeMusic);
router.get("/liked", authMiddleware.authUser, musicController.getLikedMusics);

module.exports = router;
