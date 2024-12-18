const express = require("express");

const messagesController = require("../controllers/messages-controller");
const router = express.Router();

router.get("/getMessages/:messageID", messagesController.getMessage);

module.exports = router;
