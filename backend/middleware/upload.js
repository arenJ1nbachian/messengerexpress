const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
