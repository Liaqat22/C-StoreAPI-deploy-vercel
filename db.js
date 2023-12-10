const mongoose = require("mongoose");
const colors = require("colors")
const dotenv = require( 'dotenv' )


dotenv.config()


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.Mongo_url);
    console.log('MongoDB connected successfully'.bgMagenta.white);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};


module.exports = connectDB;
