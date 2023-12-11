// Import packages
const express = require("express");
const categoryController = require("./route/Category/categoryController");
const authController = require("./route/Users/authController");
const connectDB = require('./db.js');
const cors  = require("cors")

connectDB()

// Middlewares
const app = express();
app.use(express.json());
 app.use(cors())

// Routes
app.use("/api/v1/category", categoryController);
app.use("/api/v1/auth", authController);

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
