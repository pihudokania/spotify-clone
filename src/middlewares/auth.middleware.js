const jwt = require("jsonwebtoken");

function extractToken(req) {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    const authHeader = req.headers.authorization;
    if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
    return null;
}

async function authArtist(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "artist") {
            return res.status(403).json({ message: "Forbidden - Artist role required" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("authArtist error:", err.message);
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
}

async function authUser(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "user" && decoded.role !== "artist") {
            return res.status(403).json({ message: "Forbidden - Access denied" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("authUser error:", err.message);
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
}

module.exports = { authArtist, authUser };
