const { body } = require("express-validator");

const createUser = [
    body("username").notEmpty().isLength({min:5}).withMessage("username not in condition."),
    body("password").notEmpty().isLength({min:5}).withMessage("password not in condition."),
    body("role").notEmpty().withMessage("role not in empty.").isIn(["user", "admin"]).withMessage("role must be either 'user' or 'admin'."),
];

const updateUser = [
    body("username").optional().isLength({ min: 5 }).withMessage("Username must be at least 5 characters long."),
    body("password").optional().isLength({ min: 5 }).withMessage("Password must be at least 5 characters long."),
    body("role").optional().notEmpty().withMessage("Role must not be empty."),
];

const createProduct = [
    body("name").notEmpty().isLength({min:5}).withMessage("name not in condition."),
    body("price").notEmpty().isLength({min:2}).withMessage("price not in condition."),
    body("category").notEmpty().withMessage("category not in empty."),
];

const updateProduct = [
    body("name").optional().isLength({ min: 5 }).withMessage("name must be at least 5 characters long."),
    body("price").optional().isLength({ min: 2 }).withMessage("price must be at least 5 characters long."),
    body("category").optional().notEmpty().withMessage("category must not be empty."),
];

const createCategory = [
    body("name").notEmpty().isLength({min:5}).withMessage("name not in condition."),
];


const updateCategory = [
    body("name").optional().isLength({ min: 5 }).withMessage("name must be at least 5 characters long."),
];

module.exports = {
    createUser,
    updateUser,
    createProduct,
    updateProduct,
    createCategory,
    updateCategory,
};