const express = require("express");
const router = express.Router();
const convoController = require("../controllers/convo-controller");

router.get("/getConvos/:uid", convoController.getConversations);

router.post("/createConvo", convoController.createConvo);

router.get("/getConvo", convoController.getConvo);

module.exports = router;
