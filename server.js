

// import express, { json } from 'express'
// import colors from 'colors'
// import dotenv from 'dotenv'
// import connectDB from './db.js'
// import morgan from 'morgan'
// import cors from "cors"
// // import authRoute from './routes/authRoute.js'
// // import categoryRoute from './routes/categoryRoute.js'
// // import productRoute from './routes/productRoutes.js'
// // import { categoryControlller } from './controllers/categoryController.js'



// const app = express()
// dotenv.config()
// connectDB()

// app.use(express.json())
// app.use(morgan('dev'))
// app.use(cors())

// // app.use('/api/v1/auth',authRoute)
// // app.use('/api/v1/category',categoryRoute)
// // app.use('/api/v1/product' , productRoute)


// // app.get("/api/v1/category/get-category", categoryControlller);


// app.use('/hello' , (req , res)=>{
//    try {
//     res.send('<h1>hello from the server</h1>')

//    } catch (error) {
//     console.log('fail to connet')
//    }
// })
// app.use((req, res, next) => {
//    res.setHeader("Content-Security-Policy", "script-src 'self' https://js.stripe.com/v3");
//    return next();
//  });
// const PORT = process.env.PORT || 8080

// app.listen(PORT , (req , res)=>{
// console.log(`the server successfully connected to port ${PORT} `.bgCyan.white)
// } )


// Import packages
const express = require("express");
const home = require("./route/home");
const connectDB = require('./db.js');

connectDB()

// Middlewares
const app = express();
app.use(express.json());

// Routes
app.use("/home", home);

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));