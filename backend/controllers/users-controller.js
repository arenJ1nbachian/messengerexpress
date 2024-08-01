const { validationResult } = require("express-validator/lib");
const Users = require("../models/user");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  console.log(firstname, lastname, email, password);

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).json({ errors: validationErrors.array() });
  }
  try {
    const user = new Users({ firstname, lastname, email, password });
    await user.save();
    res.status(201).json({ user });
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

exports.createUser = createUser;
exports.loginUser = loginUser;
