
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure the model name matches the exported User model
    },
    type: {
      type: String,
      enum: ["backlog", "todo", "progress", "done"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "moderate", "low"],
      required: true,
    },
    assignedTo: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    checklist: [
      {
        checked: Boolean,
        task: String,
      },
    ],
    dueDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
