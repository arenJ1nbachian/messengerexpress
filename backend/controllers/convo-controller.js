const Convo = require("../models/conversation");
const Message = require("../models/message");
const Users = require("../models/user");
const {
  getSocketsByUserId,
  searchActiveUsers,
} = require("../userOnlineStatus");

/**
 * Retrieves all conversations of a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The result containing the conversations.
 */
const getConversations = async (req, res) => {
  // Extract the user ID from the request parameters.
  const uid = req.params.uid;
  const result = new Map();

  try {
    // Retrieve all conversations where the user is a participant, sorted by the last update.
    const conversations = await Convo.find({
      participants: { $in: [uid] },
    }).sort({ updatedAt: -1 });

    // If there are no conversations, return a 404 error.
    if (conversations.length === 0) {
      return res
        .status(404)
        .json({ message: "No conversations found for this user." });
    }

    // Loop through each conversation to gather details.
    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];

      // Retrieve the last message of the conversation.
      const lastMessage = await Message.findById(convo.lastMessage);

      // Identify the other participant in the conversation.
      const nameID =
        lastMessage.sender.toString() === uid
          ? lastMessage.receiver
          : lastMessage.sender;

      // Retrieve the name and profile picture of the other participant.
      const name = await Users.findById(nameID).select(
        "firstname lastname profilePicture"
      );

      if (
        (lastMessage.sender.toString() === uid &&
          (convo.status === "Pending" || convo.status === "Rejected")) ||
        convo.status === "Accepted"
      ) {
        // Construct the result object for each conversation.
        result.set(convo._id.toString(), {
          userId: nameID, // The ID of the other participant.
          name: name.firstname + " " + name.lastname, // The full name of the other participant.
          lastMessage: {
            content: lastMessage.content,
            _id: lastMessage._id.toString(),
          }, // The content of the last message.
          who: lastMessage.sender.toString() === uid ? "You:" : "", // Indicates if the user is the sender.
          read:
            lastMessage.receiver.toString() === uid
              ? lastMessage.read
              : undefined, // Indicates if the last message is read.
          _id: convo._id.toString(), // The ID of the conversation.
          profilePicture:
            name.profilePicture === null
              ? ""
              : "http://localhost:5000/" + name.profilePicture, // URL of the other participant's profile picture.
          updatedAt: convo.updatedAt, // The timestamp of the last update.
        });
      }
    }

    // Respond with the list of conversations.
    res.status(200).json(Array.from(result.values()));
  } catch (error) {
    // Log any errors and return a 500 error response.
    console.log(error);
    res.status(500).json({ error });
  }
};

const updateConversation = async (convo, newMessage) => {
  try {
    convo.lastMessage = newMessage._id;
    convo.updatedAt = Date.now();
    if (convo.status === "Rejected") {
      convo.status = "Pending";
    }
    await convo.save();
    return convo;
  } catch (error) {
    console.log(error);
  }
};

const createMessage = async (message, senderId, receiverId, convoId) => {
  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: message,
      read: false,
      conversation: convoId,
    });

    return newMessage;
  } catch (error) {
    console.log(error);
  }
};

const createConversation = async (participants, lastMessage) => {
  try {
    const newConvo = new Convo({
      participants: participants,
      lastMessage: lastMessage,
      updatedAt: Date.now(),
    });
    await newConvo.save();
    return newConvo;
  } catch (error) {
    console.log(error);
  }
};

const emitnewRequestEvent = async (
  io,
  newConvo,
  message,
  sender,
  receiverID
) => {
  if (searchActiveUsers(receiverID)) {
    for (const socket of getSocketsByUserId(receiverID)) {
      if (newConvo.status === "Rejected") {
        console.log("Convo was rejected so upping to number");
        io.to(socket).emit("updateRequestsNumber", 1);
      }
      const messages = await Message.find({ conversation: newConvo._id })
        .sort({ timestamp: -1 })
        .limit(20)
        .select("content timestamp _id sender");
      io.to(socket).emit("newRequest", {
        _id: newConvo._id.toString(),
        lastMessage: {
          content: message.content,
          _id: message._id.toString(),
        },
        messages: messages,
        name: sender.firstname + " " + sender.lastname,
        profilePicture:
          sender.profilePicture === null
            ? ""
            : "http://localhost:5000/" + sender.profilePicture,
        read: message.read,
        updatedAt: newConvo.updatedAt,
        userId: sender._id.toString(),
        who: "",
      });
    }
  } else {
    console.log("User is offline, there's no need to emit the event");
  }
};

const emitRealTimeEvent = (io, convo, newMessage, sender, receiverID) => {
  if (searchActiveUsers(receiverID)) {
    console.log(getSocketsByUserId(receiverID));
    for (const socket of getSocketsByUserId(receiverID)) {
      io.to(socket).emit(`updateConversationHeader`, {
        convoReceiver: {
          _id: convo._id.toString(),
          lastMessage: {
            content: newMessage.content,
            _id: newMessage._id.toString(),
          },
          name: sender.firstname + " " + sender.lastname,
          profilePicture:
            sender.profilePicture === null
              ? ""
              : "http://localhost:5000/" + sender.profilePicture,
          read: newMessage.read,
          updatedAt: convo.updatedAt,
          userId: sender._id.toString(),
          who: "",
        },
      });
    }
  } else {
    console.log("User is offline, there's no need to emit the event");
  }
};

const getRequests = async (req, res) => {
  const uid = req.params.uid;
  try {
    let requestsList = [];
    const requests = await Convo.find({ status: "Pending" }).sort({
      updatedAt: -1,
    });

    if (requests.length > 0) {
      for (const request of requests) {
        const lastMessage = await Message.findById(request.lastMessage);

        if (lastMessage.receiver.toString() === uid) {
          const sender = await Users.findById(lastMessage.sender);
          const messages = await Message.find({ conversation: request._id })
            .sort({ timestamp: -1 })
            .limit(20)
            .select("content timestamp _id sender");
          requestsList.push({
            _id: request._id,
            lastMessage: {
              content: lastMessage.content,
              _id: lastMessage._id.toString(),
            },
            messages: messages,
            name: sender.firstname + " " + sender.lastname,
            profilePicture:
              sender.profilePicture === null
                ? ""
                : "http://localhost:5000/" + sender.profilePicture,
            read: lastMessage.read,
            updatedAt: request.updatedAt,
            userId: sender._id.toString(),
            who: "",
          });
        }
      }
    } else {
      return res.status(200).json({ requests: [] });
    }

    return res.status(200).json({ requests: requestsList });
  } catch (error) {}
};

const getRequestCount = async (req, res) => {
  const uid = req.params.uid;
  let reqCount = 0;
  try {
    const requests = await Convo.find({
      $and: [{ status: "Pending" }, { participants: { $in: [uid] } }],
    }).sort({
      updatedAt: -1,
    });
    for (const request of requests) {
      const lastMessage = await Message.findById(request.lastMessage);

      if (lastMessage.receiver.toString() === uid) {
        reqCount++;
      }
    }
    return res.status(200).json({ count: reqCount });
  } catch (error) {
    console.log(error);
  }
};

// Accept a conversation request. This will update the status of the conversation to "Accepted"
const acceptRequest = async (req, res) => {
  const { convoId } = req.body;
  console.log(convoId);
  try {
    const convo = await Convo.findById(convoId);
    if (convo) {
      convo.status = "Accepted";
      await convo.save();
      res.status(200).json({ convo });
    } else {
      res.status(404).json({ message: "Conversation not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// Reject a conversation request. This will update the status of the conversation to "Rejected"
const rejectRequest = async (req, res) => {
  const { convoId } = req.body;
  try {
    const convo = await Convo.findById(convoId);
    if (convo) {
      convo.status = "Rejected";
      await convo.save();
      res.status(200).json({ convo });
    } else {
      res.status(404).json({ message: "Conversation not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const emitRemoveFromRequestsEvent = (io, convoID, receiverID) => {
  if (searchActiveUsers(receiverID)) {
    for (const socket of getSocketsByUserId(receiverID)) {
      io.to(socket).emit("removeFromRequests", { convoID });
    }
  } else {
    console.log("User is offline, there's no need to emit the event");
  }
};

/**
 * Creates a new conversation between two users, or updates an existing one.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} io - The socket.io object.
 * @returns {Object} - The result containing the conversation.
 */
const createConvo = async (req, res, io) => {
  const { userID1, userName2, message } = req.body;
  const user2Firstname = userName2.split(" ")[0];
  const user2Lastname = userName2.split(" ")[1];

  try {
    const receiver = await Users.findOne({
      firstname: user2Firstname,
      lastname: user2Lastname,
    });
    const sender = await Users.findById(userID1);

    const participants = [sender._id, receiver._id];

    const convo = await Convo.findOne({ participants: { $all: participants } });
    const newMessage = await createMessage(message, sender._id, receiver._id);

    if (convo) {
      const lastMessage = await Message.findById(convo.lastMessage);
      newMessage.conversation = convo._id;

      // If the conversation already exists, emit a real-time event
      // Or if the conversation is pending and the user who sent this current message was also
      // the same user who received the last message, emit a realTimeEvent.
      // This will also change the status of the conversation to "Accepted" and will also emit
      // a realTimeEvent to remove the request from the other user's screen since it's being accepted
      if (convo.status === "Accepted") {
        convo.updatedAt = Date.now();
        emitRealTimeEvent(
          io,
          convo,
          newMessage,
          sender,
          receiver._id.toString()
        );
      } else if (
        convo.status === "Pending" &&
        lastMessage.receiver.equals(sender._id)
      ) {
        convo.status = "Accepted";
        emitRealTimeEvent(
          io,
          convo,
          newMessage,
          sender,
          receiver._id.toString()
        );
        emitRemoveFromRequestsEvent(io, convo._id, sender._id.toString());
      }
      // If the conversation is pending and the user who sent this current message was also
      // the same user who sent the last message, emit a newRequest event to the other user.
      // This will just change the information shown on the other user's screen
      else if (
        (convo.status === "Pending" || convo.status === "Rejected") &&
        lastMessage.sender.equals(sender._id)
      ) {
        emitnewRequestEvent(
          io,
          convo,
          newMessage,
          sender,
          receiver._id.toString()
        );
      }

      updateConversation(convo, newMessage);

      res.status(201).json({
        convoSender: {
          _id: convo._id.toString(),
          lastMessage: {
            content: newMessage.content,
            _id: newMessage._id.toString(),
          },
          name: receiver.firstname + " " + receiver.lastname,
          profilePicture:
            receiver.profilePicture === null
              ? ""
              : "http://localhost:5000/" + receiver.profilePicture,
          updatedAt: convo.updatedAt,
          userId: receiver._id.toString(),
          who: "You:",
        },
      });
    } else {
      const newConvo = await createConversation(participants, newMessage._id);

      newMessage.conversation = newConvo._id;

      emitnewRequestEvent(
        io,
        newConvo,
        newMessage,
        sender,
        receiver._id.toString()
      );

      if (searchActiveUsers(receiver._id.toString())) {
        console.log("Updating requests number");
        for (const socket of getSocketsByUserId(receiver._id.toString())) {
          io.to(socket).emit("updateRequestsNumber", 1);
        }
      }

      res.status(201).json({
        convoSender: {
          _id: newConvo._id.toString(),
          lastMessage: {
            content: newMessage.content,
            _id: newMessage._id.toString(),
          },
          name: receiver.firstname + " " + receiver.lastname,
          profilePicture:
            receiver.profilePicture === null
              ? ""
              : "http://localhost:5000/" + receiver.profilePicture,
          read: false,
          updatedAt: newConvo.updatedAt,
          userId: receiver._id.toString(),
          who: "You:",
        },
      });
    }
    await newMessage.save();
  } catch (error) {
    console.log(error);
  }
};

/**
 * Retrieves a conversation by its ID from the database and sends it as a response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The function does not return anything.
 */
const getConvo = async (req, res) => {
  // Get the conversation ID from the request body
  const { convoID } = req.body;

  try {
    // Find the conversation in the database by its ID
    const convo = await Convo.findById(convoID);

    // Send the conversation as a successful response
    res.status(200).json({ convo });
  } catch (error) {
    // If there is an error, log it and send an error response
    console.log(error);
    res.status(500).json({ error });
  }
};

const convoRead = async (req, res) => {
  const { convoID } = req.body;
  try {
    const convo = await Convo.findById(convoID);
    console.log("Convo to set read to true: ", convo);
    if (convo) {
      const message = await Message.findById(convo.lastMessage);
      message.read = true;
      await message.save();
      res.status(200).json({ message });
    } else {
      res.status(404).json({ message: "Conversation not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getMessageRead = async (req, res) => {
  const { convoID } = req.params;
  try {
    const convo = await Convo.findById(convoID);
    if (convo) {
      const message = await Message.findById(convo.lastMessage);
      res.status(200).json({ read: message.read });
    } else {
      res.status(404).json({ message: "Conversation not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getRecentMessage = async (req, res) => {
  const { convoID } = req.params;
  const limit = 20;
  try {
    const messages = await Message.find({ conversation: convoID })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("content timestamp _id sender");

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getOlderMessages = async (req, res) => {
  const { convoID, lastMessageId } = req.query;

  const limit = 20;

  try {
    const messages = await Message.find({
      conversation: convoID,
      _id: { $lt: lastMessageId },
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

exports.getConversations = getConversations;
exports.createConvo = createConvo;
exports.getConvo = getConvo;
exports.convoRead = convoRead;
exports.getMessageRead = getMessageRead;
exports.getRequests = getRequests;
exports.acceptRequest = acceptRequest;
exports.rejectRequest = rejectRequest;
exports.getRequestCount = getRequestCount;
exports.getRecentMessage = getRecentMessage;
exports.getOlderMessages = getOlderMessages;
