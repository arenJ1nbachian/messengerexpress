const express = require("express");
const router = express.Router();
const convoController = require("../controllers/convo-controller");

module.exports = (io) => {
  router.get("/getConvos/:uid", convoController.getConversations);

  router.post("/createConvo", (req, res) =>
    convoController.createConvo(req, res, io)
  );

  router.get("/getConvo", convoController.getConvo);

  router.patch("/convoRead", convoController.convoRead);

  router.get("/getMessageRead/:convoID", convoController.getMessageRead);

  router.get("/getRequests/:uid", convoController.getRequests);

  return router;
};
