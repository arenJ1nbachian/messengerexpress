const express = require("express");
const router = express.Router();
const convoController = require("../controllers/convo-controller");
const authenticateToken = require("../middleware/authenticateToken");

module.exports = (io) => {
  router.get(
    "/getConvos/:uid",
    authenticateToken,
    convoController.getConversations
  );

  router.post("/createConvo", authenticateToken, (req, res) =>
    convoController.createConvo(req, res, io)
  );

  router.get("/getConvo", authenticateToken, convoController.getConvo);

  router.patch("/convoRead", authenticateToken, convoController.convoRead);

  router.get(
    "/getMessageRead/:convoID",
    authenticateToken,
    convoController.getMessageRead
  );

  router.get(
    "/getRequests/:uid",
    authenticateToken,
    convoController.getRequests
  );

  router.get(
    "/getRequestCount/:uid",
    authenticateToken,
    convoController.getRequestCount
  );

  router.patch(
    "/acceptRequest",
    authenticateToken,
    convoController.acceptRequest
  );

  router.patch(
    "/rejectRequest",
    authenticateToken,
    convoController.rejectRequest
  );

  router.get(
    "/getRecentMessages/:convoID",
    authenticateToken,
    convoController.getRecentMessage
  );

  return router;
};
