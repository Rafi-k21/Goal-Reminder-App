import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false }
});

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: Date },
  category: { type: String },
  steps: [taskSchema], 
});

export default mongoose.model("Goal", goalSchema);
