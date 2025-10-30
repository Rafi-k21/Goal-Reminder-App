import express from "express";
import Goal from "../models/Goal.js";

const router = express.Router();

// Get all goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add goal
router.post("/", async (req, res) => {
  try {
    const { title, deadline, category } = req.body;
    const goal = new Goal({ title, deadline, category, steps: [] });
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update goal
router.put("/:id", async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add step to goal
router.post("/:goalId/steps", async (req, res) => {
  try {
    const { text } = req.body;
    const goal = await Goal.findById(req.params.goalId);
    goal.steps.push({ text });
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle step completion
router.put("/:goalId/steps/:stepId/toggle", async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    const step = goal.steps.id(req.params.stepId);
    step.done = !step.done;
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit step text
router.put("/:goalId/steps/:stepId", async (req, res) => {
  try {
    const { text } = req.body;
    const goal = await Goal.findById(req.params.goalId);
    const step = goal.steps.id(req.params.stepId);
    step.text = text;
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a step
router.delete("/:goalId/steps/:stepId", async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    goal.steps.id(req.params.stepId).deleteOne();
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a whole goal
router.delete("/:id", async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
