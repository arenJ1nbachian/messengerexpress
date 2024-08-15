const { validationResult } = require("express-validator/lib");
const Users = require("../models/user");
const path = require("path");
const jwt = require("jsonwebtoken");

/**
 * Creates a new user in the database.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @returns {Object} - Returns the created user or an error message
 */
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If the request has errors, log them and return the error messages
    console.log(errors.array());
    return res.status(422).json({ errors: errors.array() });
  }

  // Extract the user details from the request body
  const { firstname, lastname, email, password } = req.body;

  // If the request has a file, use the path as the profile picture
  let profilePicture = null;

  if (req.file) {
    profilePicture = req.file.path;
  }

  try {
    // Create a new user in the database
    const user = new Users({
      firstname,
      lastname,
      email,
      password,
      profilePicture,
    });
    await user.save();
    // Return the created user
    res.status(201).json({ user });
  } catch (error) {
    // If there is an error, log it and return an error message
    console.log(error);
    res.status(500).json({ error });
  }
};

/**
 * Retrieves the profile picture of a user from the database and sends it as a response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The function does not return anything.
 */
const getUserPicture = async (req, res) => {
  // Log the user ID from the request parameters
  console.log(req.params.uid);

  try {
    // Find the user in the database by their ID
    const user = await Users.findById(req.params.uid);

    // If the user does not have a profile picture, return a 404 error
    if (user.profilePicture === null) {
      res.status(404).json({ error: "Profile picture not found" });
    } else {
      // If the user has a profile picture, send the profile picture as a response
      res.sendFile(path.join(__dirname, "..\\", user.profilePicture));
    }
  } catch (error) {
    // If there is an error, log it and return an error message
    console.log(error);
    res.status(500).json({ error });
  }
};

/**
 * Retrieves the firstname and lastname of a user from the database and sends it as a response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The function does not return anything.
 */
const getUserInfo = async (req, res) => {
  try {
    // Find the user in the database by their ID and select only the firstname and lastname fields
    const userDetails = await Users.findById(req.params.uid).select(
      "firstname lastname"
    );

    // Send the user details as a successful response
    res.status(200).json({ userDetails });
  } catch (error) {
    // If there is an error, log it and send an error response
    console.log(error);
    res.status(500).json({ error });
  }
};

/**
 * Logs in a user with the given credentials.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The function does not return anything.
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database by their email
    const user = await Users.findOne({ email });

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the password is invalid, return a 401 error
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: user._id }, "secretkey", {
      expiresIn: "1h",
    });

    // Return the token and the user ID as a successful response
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    // If there is an error, log it and return an error message
    console.log(error);
    res.status(500).json({ error });
  }
};

/**
 * Searches for users with the given search string.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The function does not return anything.
 */
const searchUsers = async (req, res) => {
  const { searchString } = req.params;

  const { userId } = req.body;

  const strings = searchString.split(" ");

  /**
   * Find all users that match any of the search strings in the database.
   * The search strings are used to match the beginning of the user's firstname or lastname.
   * The search is case-insensitive.
   */
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

  /**
   * Filter out the user who is performing the search and map the result to
   * the desired format.
   */
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
