import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import goalRoutes from "./routes/goalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:5500", // for local testing (you can adjust)
  "http://localhost:5173",
  "https://goal-reminder-app.netlify.app", // your Netlify domain
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Connect MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/goals", authMiddleware, goalRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🚀 Goal Reminder API running" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(500).json({ message: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
