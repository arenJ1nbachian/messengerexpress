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

const searchUsers = async (req, res) => {
  const { searchString } = req.params;

  const { userId } = req.body;

  const strings = searchString.split(" ");

  const users = await Users.find({
    $or: strings
      .map((str) => ({
        firstname: { $regex: `^${str}`, $options: "i" },
      }))
      .concat(
        strings.map((str) => ({
          lastname: { $regex: `^${str}`, $options: "i" },
        }))
      ),
  }).select("_id firstname lastname profilePicture");

  console.log(users);

  const result = users
    .filter((user) => user._id.toString() !== userId)
    .map((user) => ({
      firstname: user.firstname,
      lastname: user.lastname,
      profilePicture: "http://localhost:5000/" + user.profilePicture,
    }));

  res.status(200).json({ result });
};

exports.createUser = createUser;
exports.loginUser = loginUser;
exports.getUserPicture = getUserPicture;
exports.getUserInfo = getUserInfo;
exports.searchUsers = searchUsers;
