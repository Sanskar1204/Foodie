const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    // eslint-disable-next-line no-console
    console.warn('MONGO_URI not set; MongoDB features will be disabled.');
    return;
  }
  if (isConnected) return;
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed:', error?.message || error);
    throw error;
  }
}

module.exports = { connectToDatabase, mongoose };
