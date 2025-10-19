import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import goalRoutes from "./routes/goalRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/goals", goalRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
