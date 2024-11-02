
const express = require("express");
const { protect } = require("../middlewares/jwt.js");
const {
  createTask,
  getTask,
  getUserTasks,
  shiftTask,
  taskAnalytics,
  updateCheckListTask,
  deleteSingleTask,
  editTask
} = require("../controllers/taskController.js");
const router = express.Router();

router.post("/create", protect, createTask);
router.get("/", protect, getUserTasks);
router.get("/analytics", protect, taskAnalytics);
router.get("/:taskId", getTask);
router.patch("/edit/:taskId", protect, editTask);
router.delete("/:taskId", protect, deleteSingleTask);
router.patch("/shift/:taskId", protect, shiftTask);
router.patch("/:taskId/:checkId", protect, updateCheckListTask);

module.exports = router;
