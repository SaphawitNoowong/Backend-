const passport = require("passport");
const express = require("express");
const bcrypt = require("bcrypt");
const mongoDbInstant = require("../db/mongoDb");
const middleware = require("../middlewares/userRole")
const validator = require("../validator/validateUser")


const router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "users";
const { ObjectId } = require('mongodb');
const { validationResult } = require("express-validator");



const saltRounds = 10;
const checkUser = passport.authenticate("jwt-verify", { session: false });

router.get("/", checkUser,middleware.isAdmin, async (req, res) => {
    try { 
      await client.connect();
  
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(collectionName);
  
      const result = await collection.find({}).toArray();
  
      res.send({
        data: result,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
      });
    } finally {
      await client.close();
    }
  });

//   router.post(
//     "/",
//     validator.createUser,
//     async (req, res) => {
//     try {
//       const errorResult = validationResult(req);
  
//       if(!errorResult.isEmpty()){
//         return res.status(400).send({
//           message:"validation error",
//           errors:errorResult.array(),
//         });
//       }
  
      
//       const userData = {
//         username: req.body.username,
//         password: req.body.password,
//         full_name: req.body.full_name,
//         role: req.body.role,
//       };
  
//       await client.connect();
//       const db = client.db(mongoDbInstant.getDbName());
//       const collection = db.collection(collectionName);
  
//       const usersCount = await collection.countDocuments({
//         username: userData.username,
//       });
  
//       if (usersCount > 0) {
//         return res.status(400).send({
//           message: "Username already exists",
//         });
//       }
  
//       const hashPassword = bcrypt.hashSync(req.body.password, saltRounds);
//       const newUser = { username, password_hash: hashPassword, full_name, role };
  
//       const result = await collection.insertOne(newUser);
  
//       res.send({
//         message: "User created successfully",
//         data: result,
//       });
//     } catch (error) {
//       res.status(500).send({
//         message: error?.message ?? "ระบบขัดข้อง",
//       });
//     } finally {
//       await client.close();
//     }
//   });

  
router.post("/",validator.createUser, async (req, res) => {
    try {
    const errorResult = validationResult(req);
        if(!errorResult.isEmpty()){
                return res.status(400).send({
                  message:"validation error",
                  errors:errorResult.array(),
                });
              }
         
      const { username, password, full_name, role } = req.body;
  
      await client.connect();
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(collectionName);
  
      const userExists = await collection.countDocuments({ username });
      if (userExists > 0) {
        return res.status(400).send({ message: "User already exists" });
      }
  
      const passwordHash = bcrypt.hashSync(password, saltRounds);
      const newUser = { username, password_hash: passwordHash, full_name, role };
  
      await collection.insertOne(newUser);
      res.status(201).send({ message: "User created successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error creating user", error: error.message });
    } finally {
      await client.close();
    }
  });
  
  
  router.put("/:id", checkUser,validator.updateUser,middleware.isAdmin, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).send({ message: "Forbidden: Admin access only." });
      }
  
      const { id } = req.params;
      const { username, full_name, role } = req.body;
  
      await client.connect();
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(collectionName);
  
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { username, full_name, role } }
      );
  
      if (updateResult.matchedCount === 0) {
        return res.status(404).send({ message: "User not found" });
      }
  
      res.status(200).send({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error updating user", error: error.message });
    } finally {
      await client.close();
    }
  });
  
  
  router.delete("/:id", checkUser,middleware.isAdmin, async (req, res) => {
    try {
      
  
      const { id } = req.params;
  
      await client.connect();
      const db = client.db(mongoDbInstant.getDbName());
      const collection = db.collection(collectionName);
  
      const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
  
      if (deleteResult.deletedCount === 0) {
        return res.status(404).send({ message: "User not found" });
      }
  
      res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error deleting user", error: error.message });
    } finally {
      await client.close();
    }
  });
  
  module.exports = router;