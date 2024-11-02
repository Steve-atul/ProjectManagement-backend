
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/jwt.js");
const { assignPeople, updateUser } = require("../controllers/userController.js");

router.put("/update", protect, updateUser);
router.put("/assignee", protect, assignPeople);

module.exports = router;
