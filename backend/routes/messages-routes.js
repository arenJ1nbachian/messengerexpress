const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const messagesController = require("../controllers/messages-controller");
const router = express.Router();

router.get(
  "/getMessages/:messageID",
  authenticateToken,
  messagesController.getMessage
);

module.exports = router;
