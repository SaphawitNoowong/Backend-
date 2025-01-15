const passport = require("passport");
const express = require("express");
const multer = require("multer");

const mongoDbInstant = require("../db/mongoDb");
const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "products";
const validator = require("../validator/validateUser")
const middleware = require("../middlewares/userRole")


const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const upload = multer();
const checkUser = passport.authenticate("jwt-verify", { session: false });

router.use(bodyParser.json()); // for parsing routerlication/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing routerlication/x-www-form-urlencoded
router.use(upload.array());


router.get("/", checkUser,middleware.isUserOrAdmin, async (req, res) => {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);
  
    const products = await collection.find({}).toArray();
  
    res.send({
      message: "Products Found",
      data: products,
    });
  });
  
  
  router.get("/category/:categoryId", checkUser,middleware.isUserOrAdmin, async (req, res) => {
    const { categoryId } = req.params;
  
    try {
      await client.connect();
      const db = client.db(mongoDbInstant.getDbName());
      const productsCollection = db.collection(collectionName);
      const categoriesCollection = db.collection("categories");
  
      const products = await productsCollection.find({ category: new ObjectId(categoryId) }).toArray();
  
      if (products.length === 0) {
        return res.status(404).send({
          message: "No products found for the given category ID",
        });
      }
  
      const category = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });
  
      if (!category) {
        return res.status(404).send({
          message: "Category not found for the given ID",
        });
      }
  
      const productsWithCategoryName = products.map((product) => ({
        ...product,
        categoryName: category.name,
      }));
  
      res.send({
        message: "Products under the category found",
        data: productsWithCategoryName,
      });
    } catch (err) {
      res.status(500).send({
        message: "An error occurred while retrieving products",
        error: err.message,
      });
    }
  });
  
 
  router.post("/items", checkUser,validator.createProduct,middleware.isAdmin, async (req, res) => {
    const { name, price, category } = req.body;
  
    try {
      await client.connect();
      const db = client.db(mongoDbInstant.getDbName());
      const categoriesCollection = db.collection("category");
      const productsCollection = db.collection(collectionName);
  
      const categoryDoc = await categoriesCollection.findOne({ _id: new ObjectId(category) });
  
      if (!categoryDoc) {
        return res.status(400).send({
          message: "Category not found. Please provide a valid category ID.",
        });
      }
  
      const result = await productsCollection.insertOne({
        name,
        price,
        category: new ObjectId(category),
      });
  
      res.send({
        message: "Product added successfully",
        data: result,
      });
    } catch (err) {
      res.status(500).send({
        message: "An error occurred while adding the product",
        error: err.message,
      });
    }
  });
  
  
  router.put("/changeitems/:id", checkUser,validator.updateProduct,middleware.isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, price, category } = req.body;
  
    try {
      await client.connect();
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(collectionName);
  
      const updatedData = {};
      if (name) updatedData.name = name;
      if (price) updatedData.price = price;
      if (category) updatedData.category = new ObjectId(category);
  
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).send({
          message: "Product not found",
        });
      }
  
      res.send({
        message: "Product updated successfully",
        data: result,
      });
    } catch (err) {
      res.status(500).send({
        message: "An error occurred while updating the product",
        error: err.message,
      });
    }
  });
  
  
  router.delete("/deleteitems/:id", checkUser,middleware.isAdmin, async (req, res) => {
    const { id } = req.params;
  
    try {
        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const collection = db.collection(collectionName);

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: "Product not found or already deleted",
            });
        }

        res.send({
            message: "Product deleted successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error deleting product:", error.message);

        res.status(500).send({
            message: "An error occurred while deleting the product",
            error: error.message,
        });
    } finally {
        await client.close();
    }
  });

  module.exports = router;