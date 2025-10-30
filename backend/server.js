import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// ✅ Use this CORS configuration
const allowedOrigins = [
  "https://goal-reminder-app.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// ✅ Apply CORS globally before routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => res.send("✅ Backend is running fine!"));

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
