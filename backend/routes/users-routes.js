const express = require("express");

const usersController = require("../controllers/users-controller");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/register",
  check("firstname").not().isEmpty(),
  check("lastname").not().isEmpty(),
  check("email").not().isEmpty(),
  check("password").not().isEmpty(),
  usersController.createUser
);

router.post("/login", usersController.loginUser);

module.exports = router;
