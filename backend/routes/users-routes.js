const express = require("express");

const usersController = require("../controllers/users-controller");
const { check } = require("express-validator");
const router = express.Router();

router.post(
  "/",
  check("firstName").not().isEmpty(),
  check("lastName").not().isEmpty(),
  check("email").not().isEmpty(),
  check("password").not().isEmpty(),
  usersController.createUser
);

router.post("/login", usersController.loginUser);

module.exports = router;
