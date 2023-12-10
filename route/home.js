const express = require("express");
const categoryModel = require("./categoryModel");
const router = express.Router();

router.get("/get-category", async (req, res, next) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching categories",
      error: error.message,
    });
  }
});

module.exports = router;
