const { validationResult } = require("express-validator/lib");
const Users = require("../models/user");
const path = require("path");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).json({ errors: errors.array() });
  }

  const { firstname, lastname, email, password } = req.body;

  let profilePicture = null;

  if (req.file) {
    profilePicture = req.file.path;
  }
  try {
    const user = new Users({
      firstname,
      lastname,
      email,
      password,
      profilePicture,
    });
    await user.save();
    res.status(201).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getUserPicture = async (req, res) => {
  console.log(req.params.uid);
  try {
    const user = await Users.findById(req.params.uid);
    if (user.profilePicture === null) {
      res.status(404).json({ error: "Profile picture not found" });
    } else {
      res.sendFile(path.join(__dirname, "..\\", user.profilePicture));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const userDetails = await Users.findById(req.params.uid).select(
      "firstname lastname"
    );
    res.status(200).json({ userDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, "secretkey", {
      expiresIn: "1h",
    });
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getProfilePictures = async (req, res) => {
  const { userIDs } = req.body;

  try {
    const users = await Users.find({ _id: { $in: userIDs } });

    const profilePicturesUrl = users.map((user) => {
      if (user.profilePicture) {
        return "http://localhost:5000/" + user.profilePicture;
      } else {
        return null;
      }
    });
    res.status(200).json({ profilePicturesUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

exports.createUser = createUser;
exports.loginUser = loginUser;
exports.getUserPicture = getUserPicture;
exports.getUserInfo = getUserInfo;
exports.getProfilePictures = getProfilePictures;
