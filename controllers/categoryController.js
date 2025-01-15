const passport = require("passport");
const express = require("express");
const multer = require("multer");

const mongoDbInstant = require("../db/mongoDb");
const router2 = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "category";
const validator = require("../validator/validateUser")
const middleware = require("../middlewares/userRole")

const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const upload = multer();
const checkUser = passport.authenticate("jwt-verify", { session: false });

router2.use(bodyParser.json());
router2.use(bodyParser.urlencoded({ extended: true }));
router2.use(upload.array());


router2.get("/", checkUser,middleware.isUserOrAdmin, async (req, res) => {
    try {
        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const collection = db.collection(collectionName);

        const categories = await collection.find({}).toArray();

        if (categories.length === 0) {
            return res.status(404).send({
                message: "No categories found",
                data: [],
            });
        }

        res.send({
            message: "Categories Found",
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error.message);

        res.status(500).send({
            message: "An error occurred while fetching categories",
            error: error.message,
        });
    } finally {
        await client.close(); 
    }
});
  
  
  router2.post("/addcategory", checkUser,validator.createCategory,middleware.isAdmin, async (req, res) => {
    const { name } = req.body;
    try {
        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const collection = db.collection(collectionName);
  
        
        const existingCategory = await collection.findOne({ name });
        if (existingCategory) {
          return res.status(400).send({
            message: "Category already exists",
          });
        }
  
        const result = await collection.insertOne({ name });
        res.send({
          message: "Category added successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error adding category:", error.message);
  
        res.status(500).send({
          message: "An error occurred while adding the category",
          error: error.message,
        });
      } finally {
        await client.close(); 
      }
    }
  );
  
  
  router2.put("/changecategory/:id", checkUser,validator.updateCategory,middleware.isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
  
    try {
        await client.connect();
        const db = client.db(mongoDbInstant.getDbName());
        const collection = db.collection(collectionName);
  
        
        const existingCategory = await collection.findOne({ _id: new ObjectId(id) });
        if (!existingCategory) {
          return res.status(404).send({
            message: "Category not found",
          });
        }
  
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { name } }
        );
  
        if (result.modifiedCount === 0) {
          return res.status(400).send({
            message: "Category not updated. The name might be the same.",
          });
        }
  
        res.send({
          message: "Category updated successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error updating category:", error.message);
  
        res.status(500).send({
          message: "An error occurred while updating the category",
          error: error.message,
        });
      } finally {
        await client.close(); 
      }
    }
  );
  
  
  router2.delete("/deletecategory/:id", checkUser, async (req, res) => {
    const { id } = req.params;

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);

    
    const existingCategory = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingCategory) {
      return res.status(404).send({
        message: "Category not found",
      });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(400).send({
        message: "Category could not be deleted",
      });
    }

    res.send({
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting category:", error.message);

    res.status(500).send({
      message: "An error occurred while deleting the category",
      error: error.message,
    });
  } finally {
    await client.close(); 
  }
});

module.exports = router2;