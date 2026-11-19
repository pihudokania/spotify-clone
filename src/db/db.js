const mongoose = require('mongoose');

async function connectDB() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('CRITICAL: MONGO_URI is not defined in environment variables!');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error.message || error);
    }
}

module.exports = connectDB;