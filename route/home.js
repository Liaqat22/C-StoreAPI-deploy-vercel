const express = require("express");
const categoryModel = require("./categoryModel");
const router = express.Router();

router.get("/", async (req, res, next) => {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

module.exports = router;


