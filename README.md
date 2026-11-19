# 🎵 Spotify Clone Backend API

A full-featured Node.js & Express REST API for a Spotify clone application. Features role-based user/artist authentication, cloud audio and cover artwork uploads via ImageKit, album and track management, instant search, and user favorites.

---

## 🚀 Features

- **Authentication & RBAC**:
  - Secure registration and login with `bcryptjs` and `jsonwebtoken`.
  - Roles: `user` (listener) and `artist`.
  - Dual token support: HTTP-only cookies and `Authorization: Bearer <token>` headers.
  - Profile retrieval (`/api/auth/me`).
- **Music Management**:
  - Artists can upload MP3 audio tracks with optional cover artwork.
  - Associate tracks with albums.
  - Track duration and metadata tracking.
  - Pagination, sorting, and search filters.
- **Albums**:
  - Artists can create albums with custom cover images and track lists.
  - Fetch all albums or view an album with all populated songs and artist details.
- **Search & Discovery**:
  - Multi-entity search across tracks, albums, and artists.
- **Favorites / Liked Songs**:
  - Users can like/unlike tracks with persistence.
  - Dedicated endpoint to fetch all liked songs.
- **Cloud Media Storage**:
  - High-performance media delivery and CDN storage powered by ImageKit.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB & Mongoose
- **Storage**: ImageKit (`@imagekit/nodejs`)
- **Authentication**: JWT & Cookie-Parser
- **File Uploads**: Multer (Memory Storage)

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or MongoDB Atlas)
- ImageKit account (Free tier works great)

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd spotify_clone

# Install dependencies
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory (see `.env.example`):

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 4. Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

---

## ☁️ Deployment Guide (Get your Deployed Live Link)

### Deploying to Render (Recommended & Free)

1. **Push your code to GitHub** (see the GitHub section below).
2. Go to [Render.com](https://render.com) and sign up / log in with your GitHub account.
3. Click **"New +"** and choose **"Web Service"**.
4. Select your `spotify-clone` repository.
5. Fill in the service settings:
   - **Name**: `spotify-clone-api` (or your preferred name)
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add the following keys from your `.env`:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_secure_random_jwt_secret`
   - `IMAGEKIT_PUBLIC_KEY`: `your_imagekit_public_key`
   - `IMAGEKIT_PRIVATE_KEY`: `your_imagekit_private_key`
   - `IMAGEKIT_URL_ENDPOINT`: `your_imagekit_url_endpoint`
7. Click **"Create Web Service"**.
8. Render will build and deploy your app. Once deployed, your live URL will be displayed at the top:
   ```
   https://<your-app-name>.onrender.com
   ```
9. Test your deployed link by opening `https://<your-app-name>.onrender.com/` in your browser. You will see the server status JSON!

---

## 📡 API Endpoints Reference

### 🌐 System & Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Live service status & endpoint directory |
| `GET` | `/health` | Public | Healthcheck and uptime probe |

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`username`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Login with username/email & password |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/auth/me` | Logged In | Get current user profile and liked songs |

### 🎶 Music & Albums (`/api/music`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/music/upload` | Artist | Upload audio (`music` file) and optional cover (`cover` file) |
| `POST` | `/api/music/album` | Artist | Create an album with cover art and songs |
| `GET` | `/api/music` | Logged In | Get all tracks (`?search=`, `?page=`, `?limit=`) |
| `GET` | `/api/music/albums` | Logged In | Get all albums with tracks and artist |
| `GET` | `/api/music/albums/:albumId` | Logged In | Get single album with populated tracks |
| `GET` | `/api/music/search?q=...` | Logged In | Search tracks, albums, and artists |
| `POST` | `/api/music/like/:musicId` | Logged In | Toggle like status on a track |
| `GET` | `/api/music/liked` | Logged In | Get user's liked tracks |

---

## 📄 License
ISC
