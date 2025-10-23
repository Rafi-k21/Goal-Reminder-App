import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import goalRoutes from "./routes/goalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";


// ✅ Load environment variables first
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // stop the app if DB fails
  });

// ✅ Routes
app.use("/api/auth", authRoutes); // Register & Login
app.use("/api/goals", authMiddleware, goalRoutes); // Protected Routes

// ✅ Root route (for testing server status)
app.get("/", (req, res) => {
  res.json({ message: "🚀 Goal Reminder API is running successfully" });
});

// ✅ Global Error Handler (Optional, for safety)
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
