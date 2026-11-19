
require('dotenv').config();
const { ImageKit } = require("@imagekit/nodejs");

let imageKitClientInstance = null;

function getImageKitClient() {
  if (!imageKitClientInstance) {
    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error("ImageKit configuration missing. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in environment variables.");
    }
    imageKitClientInstance = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imageKitClientInstance;
}

async function uploadFile(file, fileName, folder = "spotify_clone") {
  const client = getImageKitClient();
  const result = await client.files.upload({
    file,
    fileName: fileName || ("file_" + Date.now()),
    folder,
  });

  return result;
}

module.exports = { uploadFile, getImageKitClient };
