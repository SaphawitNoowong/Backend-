require("dotenv").config();
require("./middlewares/auth");

const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");

const upload = multer();
const app = express();

app.use(bodyParser.json()); // for parsing routerlication/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing routerlication/x-www-form-urlencoded
app.use(upload.array());

const authController = require("./controllers/authController");
const productController = require('./controllers/productController')
const categoryController = require('./controllers/categoryController')
const usersController = require("./controllers/usersController");

const port = 3000;

app.use("/auth", authController);
app.use("/products", productController)
app.use("/category", categoryController)
app.use("/users", usersController)

app.get("/", (req, res) => {
    res.send({
        massage: "Server is runing Connected Success products",
        version: "1.0.0",
        env: {
            mongodb_url: process.env.mongodb_url,
            mongodb_db_name: process.env.mongodb_db_name
        }
    });
});

app.get("/cate", (req, res) => {
    res.send({
        massage: "Server is runing Connected Success category",
        version: "1.0.0",
        env: {
            mongodb_url: process.env.mongodb_url,
            mongodb_db_name: process.env.mongodb_db_name
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at localhost:${port}`)
});