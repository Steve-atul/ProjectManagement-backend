const Task = require("../models/task.js");
const createError = require("../utils/createError.js");
const dotenv = require("dotenv");

dotenv.config();

const createTask = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const { type, title, priority, assignTo, checklist, dueDate } = req.body;

    if (!type || !title || !priority || !checklist) {
      return next(createError(400, "All fields are required!"));
    }

    const newTask = await Task({
      userId: user._id,
      type,
      priority,
      title,
      checklist,
      dueDate,
      assignedTo: assignTo,
    });

    await newTask.save();

    res.status(201).json({ message: "Task created successfully!" });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return next(createError(404, "Task not found!"));

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

const getUserTasks = async (req, res, next) => {
  try {
    const queryParams = new URLSearchParams(req.query);

    let startDate;
    const endDate = new Date();

    switch (queryParams.get("filter")) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        return res.status(400).json({ error: "Invalid period specified" });
    }

    const user = req.user;
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const myTasks = await Task.find({
      $or: [{ userId: user._id }, { assignedTo: user.email }],
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: -1 });

    res.status(200).json(myTasks);
  } catch (error) {
    next(error);
  }
};

const updateCheckListTask = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const { taskId, checkId } = req.params;
    const { data } = req.body;

    const filter = {
      _id: taskId,
      "checklist._id": checkId,
    };
    const updateDoc = {
      $set: { "checklist.$.checked": data },
    };

    await Task.updateOne(filter, updateDoc);

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    next(error);
  }
};

const shiftTask = async (req, res, next) => {
  try {
    const queryParams = new URLSearchParams(req.query);
    const filter = queryParams.get("filter");

    const { taskId } = req.params;
    await Task.findByIdAndUpdate(taskId, { type: filter }, { new: true });

    res.status(200).json({ message: "Task updated successfully!" });
  } catch (error) {
    next(error);
  }
};

const taskAnalytics = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const allTasks = await Task.find({
      $or: [{ userId: user._id }, { assignedTo: user.email }],
    });

    const counts = {
      priority: {
        low: 0,
        moderate: 0,
        high: 0,
      },
      status: {
        backlog: 0,
        todo: 0,
        progress: 0,
        done: 0,
      },
      dueDateTasks: 0,
    };

    allTasks.forEach((item) => {
      if (item.priority === "low") counts.priority.low++;
      if (item.priority === "moderate") counts.priority.moderate++;
      if (item.priority === "high") counts.priority.high++;

      // Count status
      if (item.type === "backlog") counts.status.backlog++;
      if (item.type === "todo") counts.status.todo++;
      if (item.type === "progress") counts.status.progress++;
      if (item.type === "done") counts.status.done++;

      // Count due date tasks
      if (item.dueDate) counts.dueDateTasks++;
    });

    res.status(200).json(counts);
  } catch (error) {
    next(error);
  }
};

const deleteSingleTask = async (req, res, next) => {
  try {
    const user = req.user;
    const { taskId } = req.params;

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return next(createError(404, "Task not found!"));
    }

    if (task.userId.toString() !== user._id.toString() && task.assignedTo !== user.email) {
      return next(createError(403, "You are not authorized to delete this task!"));
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const editTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const user = req.user;

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return next(createError(404, "Task not found!"));
    }

    if (task.userId.toString() !== user._id.toString() && task.assignedTo !== user.email) {
      return next(createError(403, "You are not authorized to edit this task"));
    }

    const { type, title, priority, assignTo, checklist, dueDate } = req.body;

    if (type) task.type = type;
    if (title) task.title = title;
    if (priority) task.priority = priority;
    if (assignTo !== undefined) task.assignedTo = assignTo;
    if (checklist) task.checklist = checklist;
    if (dueDate) task.dueDate = dueDate;

    const updatedTask = await task.save();

    res.status(200).json({
      message: "Task updated successfully!",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTask,
  getUserTasks,
  updateCheckListTask,
  shiftTask,
  taskAnalytics,
  deleteSingleTask,
  editTask,
};
