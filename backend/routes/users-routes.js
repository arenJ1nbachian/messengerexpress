const express = require("express");

const usersController = require("../controllers/users-controller");
const { check } = require("express-validator");
const upload = require("../middleware/upload");
const router = express.Router();

router.post(
  "/register",
  upload.single("file"),
  [
    check("firstname").not().isEmpty().withMessage("First name is required"),
    check("lastname").not().isEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Enter a valid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  usersController.createUser
);

router.get("/:uid/picture", usersController.getUserPicture);

router.get("/:uid/info", usersController.getUserInfo);

router.post("/login", usersController.loginUser);

router.post("/getProfilePictures", usersController.getProfilePictures);

router.post("/search/:searchString", usersController.searchUsers);

module.exports = router;
