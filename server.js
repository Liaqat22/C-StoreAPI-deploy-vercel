// Import packages
const express = require("express");
const categoryController = require("./route/Category/categoryController");
const authController = require("./route/Users/authController");
const connectDB = require('./db.js');

connectDB()

// Middlewares
const app = express();
app.use(express.json());

// Routes
app.use("/api/vi/category", categoryController);
app.use("/api/vi/auth", authController);

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
