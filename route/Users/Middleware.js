const express = require("express");
const userModel = require("./userModel");
require('dotenv').config();
const dotenv = require("dotenv");
const  JWT = require( "jsonwebtoken");
 
 const requireSignIn = async (req, res, next) => {
    try {
  
      const decode = JWT.verify(
        req.headers.authorization,
        process.env.JWT_Secrete
      );
      req.user = decode;
      next();
    } catch (error) { 
      console.log(error , "middlewareError");
      res.status(401).send('Unauthorized'); // Respond with unauthorized status
    }
  };
  
  
  //admin acceess
   const isAdmin = async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user._id);
      if (user.role !== 1) {
        return res.status(401).send({
          success: false,
          message: "UnAuthorized Access",
        });
      } else {
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(401).send({
        success: false,
        error,
        message: "Error in admin middelware",
      });
    }
  };

  module.exports = {
    isAdmin,
    requireSignIn,
  };
  