const express = require("express");
const productModel = require("./productModel");
const  fs = require( "fs");
const  slugify = require("slugify");
const  braintree = require( "braintree" );
require('dotenv').config();
const dotenv = require("dotenv");
const formidable = require("express-formidable");
const orderModel = require("./orderModel");


const router = express.Router();
const app = express();

app.use(formidable());

console.log("Braintree_Public_Key:", process.env.Braintree_Public_Key); // Check the value here

//payment gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.Braintree_Merchant_ID,
    publicKey: process.env.Braintree_Public_Key,
    privateKey: process.env.Braintree_Private_Key,
  });

// create product
router.post("/create-product",  formidable(), async (req, res) => {
    try {
      const { name, description, price, category, quantity, shipping } =
        req.fields;
      const { photo } = req.files;
      //alidation
      switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is Required" });
        case !description:
          return res.status(500).send({ error: "Description is Required" });
        case !price:
          return res.status(500).send({ error: "Price is Required" });
        case !category:
          return res.status(500).send({ error: "Category is Required" });
        case !quantity:
          return res.status(500).send({ error: "Quantity is Required" });
        case photo && photo.size > 1000000:
          return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
      }
  
      const products = new productModel({ ...req.fields, slug: slugify(name) });
      if (photo) {
        products.photo.data = fs.readFileSync(photo.path);
        products.photo.contentType = photo.type;
      }
      await products.save();
      res.status(201).send({
        success: true,
        message: "Product Created Successfully",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error in crearing product",
      });
    }
  });

//get  products
router.get("/get-product" , async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
});

// get single product
router.get ("/get-product/:slug" ,  async (req, res) => {
    try {
      const product = await productModel
        .findOne({ slug: req.params.slug })
        .select("-photo")
        .populate("category");
      res.status(200).send({
        success: true,
        message: "Single Product Fetched",
        product,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Eror while getitng single product",
        error,
      });
    }
  });

 router.get("/product-photo/:pid" ,  async (req, res) => {
    try {
      const product = await productModel.findById(req.params.pid).select("photo");
      if (product.photo.data) {
        res.set("Content-type", product.photo.contentType);
        return res.status(200).send(product.photo.data);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Erorr while getting photo",
        error,
      });
    }
  });

  //delete controller
router.delete("/delete-product/:pid" , async (req, res) => {
    try {
      await productModel.findByIdAndDelete(req.params.pid).select("-photo");
      res.status(200).send({
        success: true,
        message: "Product Deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while deleting product",
        error,
      });
    }
  });

  //upate producta
router.put("/update-product/:pid", async (req, res) => {
    try {
      const { name, description, price, category, quantity, shipping } =
        req.fields;
      const { photo } = req.files;
      //alidation
      switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is Required" });
        case !description:
          return res.status(500).send({ error: "Description is Required" });
        case !price:
          return res.status(500).send({ error: "Price is Required" });
        case !category:
          return res.status(500).send({ error: "Category is Required" });
        case !quantity:
          return res.status(500).send({ error: "Quantity is Required" });
        case photo && photo.size > 1000000:
          return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
      }
  
      const products = await productModel.findByIdAndUpdate(
        req.params.pid,
        { ...req.fields, slug: slugify(name) },
        { new: true }
      );
      if (photo) {
        products.photo.data = fs.readFileSync(photo.path);
        products.photo.contentType = photo.type;
      }
      await products.save();
      res.status(201).send({
        success: true,
        message: "Product Updated Successfully",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error in Updte product",
      });
    }
  });
  

  router.get("/related-product/:pid/:cid", async (req, res) => {
    try {
      const { pid, cid } = req.params;
      const products = await productModel
        .find({
          category: cid,
          _id: { $ne: pid },
        })
        .select("-photo")
        .limit(3)
        .populate("category");
      res.status(200).send({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "error while geting related product",
        error,
      });
    }
  });

  // search product
router.get ("/search/:keyword",async (req, res) => {
    try {
      const { keyword } = req.params;
      const resutls = await productModel
        .find({
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        })
        .select("-photo");
      res.json(resutls);
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error In Search Product API",
        error,
      });
    }
  });

  // filters
router.post ("/product-filters", async (req, res) => {
    try {
      const { checked , radio } = req.body;
      let args = {};
      if (checked.length > 0) args.category = checked;
      if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
      const products = await productModel.find(args);
      res.status(200).send({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error WHile Filtering Products",
        error,
      });
    }
  });


//payment gateway api
//token
router.get("/braintree/token", async (req, res) => {
    try {
      gateway.clientToken.generate({}, function (err, response) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(response);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  
  //payment
 router.post("/braintree/payment", async (req, res) => {
    try {
      const { nonce, cart } = req.body;
      let total = 0;
      cart.map((i) => {
        total += i.price;
      });
      let newTransaction = gateway.transaction.sale(
        {
          amount: total,
          paymentMethodNonce: nonce,
          options: {
            submitForSettlement: true,
          },
        },
        function (error, result) {
          if (result) { 
            const order = new orderModel({
              products: cart,
              payment: result,
              buyer: req.body.userId,
              buyername: req.body.Bname,
            }).save();
            res.json({ ok: true });
          } else { 
            res.status(500).send(error);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

  module.exports = router;
