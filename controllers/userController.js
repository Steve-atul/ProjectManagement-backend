

const User = require("../models/user.js");
const createError = require("../utils/createError.js");
const bcrypt = require('bcryptjs');
const dotenv = require("dotenv");

dotenv.config();

const updateUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return next(createError(404, "User not found!"));

    const realUser = await User.findById(user._id);
    const { username, email, oldPassword, newPassword } = req.body;

    if (username) {
      await realUser.updateOne({ username: username });
    }
    if (email) {
      if (email !== realUser.email) {
        const oldUser = await User.findOne({ email });
        if (oldUser) return next(createError(400, "This email already exists!"));
      }
      await realUser.updateOne({ email: email });
    }

    if (newPassword && newPassword.length < 5) {
      return next(createError(400, "Password should be at least 5 characters long."));
    }

    if (oldPassword && newPassword) {
      const isPassCorrect = await bcrypt.compare(oldPassword, realUser.password);
      if (!isPassCorrect) return next(createError(400, "Old Password is not correct!"));

      const hashedPass = await bcrypt.hash(newPassword, 10);
      await realUser.updateOne({ password: hashedPass });
    }

    res.status(200).json({ message: "Updated successfully!" });
  } catch (error) {
    next(error);
  }
};

const assignPeople = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(createError(404, "User not found!"));
    }
    const { email } = req.body;

    if (email === user.email) {
      return next(createError(400, "Yours and assignee email cannot be the same!"));
    }

    if (user.myAssignies.includes(email)) {
      return next(createError(400, "This email is already added!"));
    }

    const newUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { myAssignies: email } },
      { new: true }
    );

    const { password, ...details } = newUser._doc;
    console.log(newUser);
    res.status(200).json(details);
  } catch (error) {
    next(error);
  }
};

module.exports = { updateUser, assignPeople };

