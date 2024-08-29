const AuthController = require("../controllers/authController");
const express = require("express");
const router = express.Router();

router.post("/signup", AuthController.signupUser);
router.post("/login", AuthController.loginUser);

module.exports = router;
