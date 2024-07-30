const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  favorites: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Listings" },
  ],
  listings: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Listings" },
  ],
});

module.exports = mongoose.model("Users", userSchema);
