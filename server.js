
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const  errorHandler  = require("./middlewares/errorMiddleware.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
dotenv.config();
const port = process.env.PORT || 8000;

//middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// mongodb connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDb connection succeeded!");
  })
  .catch((err) => {
    console.log("Error connecting to Mongo" + err);
  });

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
