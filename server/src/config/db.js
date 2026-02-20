const mongoose = require("mongoose");

let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (cached.promise) return cached.promise;

  console.log("🔌 Connecting to MongoDB Atlas...");

  // Minimal options for maximum compatibility
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  };

  cached.promise = mongoose
    .connect(process.env.MONGODB_URI, options)
    .then((m) => {
      console.log(`✅ MongoDB connected — db: ${m.connection.db.databaseName}`);
      cached.promise = null; // Reset promise so it can reconnect if dropped
      return m;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      cached.promise = null;
      throw err;
    });

  return cached.promise;
}

module.exports = { connectDB };
