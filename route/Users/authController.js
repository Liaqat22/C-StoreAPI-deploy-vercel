const express = require("express");
const userModel = require("./userModel");
const orderModel = require("../Products/orderModel");
require('dotenv').config();
const dotenv = require("dotenv");
const { comparePassword, hashPassword } = require("./helper");
const  JWT = require( "jsonwebtoken");
const { isAdmin, requireSignIn } = require("./Middleware");




const router = express.Router();



// register user

router.post("/register", async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;
      //validations
      if (!name) {
        return res.send({ error: "Name is Required" });
      }
      if (!email) {
        return res.send({ message: "Email is Required" });
      }
      if (!password) {
        return res.send({ message: "Password is Required" });
      }
      if (!phone) {
        return res.send({ message: "Phone no is Required" });
      }
      if (!address) {
        return res.send({ message: "Address is Required" });
      }
      
      //check user
      const exisitingUser = await userModel.findOne({ email });
      //exisiting user
      if (exisitingUser) {
        return res.status(200).send({
          success: false,
          message: "Already Register please login",
        });
      }
      //register user
      const hashedPassword = await hashPassword(password);
      //save
      const user = await new userModel({
        name,
        email,
        phone,
        address,
        password: hashedPassword,
      }).save();
  
      res.status(201).send({
        success: true,
        message: "User Register Successfully",
        user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Errro in Registeration",
        error,
      });
    }
  });

  //POST LOGIN
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      //validation
      if (!email || !password) {
        return res.status(404).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Email is not registerd",
        });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(200).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_Secrete, {
        expiresIn: "1000d",
      });
      res.status(200).send({
        success: true,
        message: "login successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
    }
  });

 router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });
  //protected Admin route auth
  router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
  });

  router.post("/orders", async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.body.userId  })
        .populate("products", "-photo")
      res.json(orders);
    ;
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  });
  
  //orders
 router.get("/all-orders", async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  });
  
  //order status
router.put("/order-status/:orderId",  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const orders = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updateing Order",
        error,
      });
    }
  });

//get single user 
router.get('/getsingleuser/:id', async (req, res)   => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
)

//delete user

router.delete("/deleteuser/:pid", async (req, res) => {
    try {
        const { pid } = req.params

        const user = await userModel.findByIdAndDelete(pid)
        res.status(202).send({
            success: true,
            message: 'product deleted successfully'
        })

    } catch (error) {
        res.status(404).send({
            success: false,
            message: 'error in deleting product',
        })
    }
})

//get all users

router.get("/getallusers", async (req, res) => {
    try {
        const users = await userModel.find({})
          

        res.status(202).send({
            totalUsers: users.length,
            success: true,
            message: 'successfully got all products',
            users
        })

    } catch (error) {
        res.status(404).send({
            success: false,
            message: 'error in getting products',
        })
    }
})

//update profile

router.put("/updateprofile/:id", async (req, res) => {
   
    const {id} = req.params
 try {
      const { name, email, password, phone, address } = req.body;
      //validations
      if (!name) {
        return res.send({ error: "Name is Required" });
      }
      if (!email) {
        return res.send({ message: "Email is Required" });
      }
      if (!password) {
        return res.send({ message: "Password is Required" });
      }
      if (!phone) {
        return res.send({ message: "Phone no is Required" });
      }
      if (!address) {
        return res.send({ message: "Address is Required" });
      }
     
            const user =  await userModel.findByIdAndUpdate(id, { name, email, password, phone, address }, { new: true });
                      await user.save();

          res.status(200).send({
        success: true,
        messsage: "user Updated Successfully",
        user,
      });
 } catch (error){
                res.status(409).json({ message: error.message});     
            }
        
    
    })
module.exports = router;
