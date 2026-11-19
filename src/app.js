require('dotenv').config();
const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');

const app = express();

app.use(cors({
    origin: true, // Allow frontend requests from any origin (e.g. localhost:5173)
    credentials: true, // Allow cookies to be sent back and forth
}));

app.use(express.json());
app.use(cookieParser());

// Root health & status endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        name: "Spotify Clone Backend API",
        status: "online",
        message: "🎵 Backend service is up and running!",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            auth: {
                register: "POST /api/auth/register",
                login: "POST /api/auth/login",
                logout: "POST /api/auth/logout",
                me: "GET /api/auth/me"
            },
            music: {
                list: "GET /api/music",
                uploadTrack: "POST /api/music/upload",
                albums: "GET /api/music/albums",
                createAlbum: "POST /api/music/album",
                search: "GET /api/music/search?q=:query",
                likeTrack: "POST /api/music/like/:musicId",
                likedTracks: "GET /api/music/liked"
            }
        }
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled API error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
});

module.exports = app;







