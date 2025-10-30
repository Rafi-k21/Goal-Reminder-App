import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// ✅ FIXED CORS SETUP
app.use(
  cors({
    origin: ["https://goal-reminder-app.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// Your existing routes here
import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);

// Your database and server connection code below
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
