import express from "express";
import Goal from "../models/Goal.js";

const router = express.Router();

// Get all goals
router.get("/", async (req, res) => {
  const goals = await Goal.find();
  res.json(goals);
});

// Add goal
router.post("/", async (req, res) => {
  const { title, deadline, category } = req.body;
  const goal = new Goal({ title, deadline, category, steps: [] });
  await goal.save();
  res.json(goal);
});

// Add step to goal
router.post("/:goalId/steps", async (req, res) => {
  const { text } = req.body;
  const goal = await Goal.findById(req.params.goalId);
  goal.steps.push({ text });
  await goal.save();
  res.json(goal);
});

// Toggle step completion
router.put("/:goalId/steps/:stepId", async (req, res) => {
  const goal = await Goal.findById(req.params.goalId);
  const step = goal.steps.id(req.params.stepId);
  step.done = !step.done;
  await goal.save();
  res.json(goal);
});

// Delete a step
router.delete("/:goalId/steps/:stepId", async (req, res) => {
  const goal = await Goal.findById(req.params.goalId);
  goal.steps.id(req.params.stepId).deleteOne();
  await goal.save();
  res.json(goal);
});

// Delete a whole goal
router.delete("/:id", async (req, res) => {
  await Goal.findByIdAndDelete(req.params.id);
  res.json({ message: "Goal deleted" });
});

export default router;
// Update goal
router.put("/:id", async (req, res) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(goal);
});

// Toggle step (done/undone)
router.put("/:goalId/steps/:stepId/toggle", async (req, res) => {
  const goal = await Goal.findById(req.params.goalId);
  const step = goal.steps.id(req.params.stepId);
  step.done = !step.done;
  await goal.save();
  res.json(goal);
});
