const Convo = require("../models/conversation");
const Message = require("../models/message");
const Users = require("../models/user");
const {
  getSocketsByUserId,
  searchActiveUsers,
} = require("../userOnlineStatus");

/**
 * Helper function to get the other participant in a conversation
 * @param {Object} lastMessage - Last message object
 * @param {string} uid - Current user ID
 * @returns {string} - Other participant's ID
 */
const getOtherParticipant = (lastMessage, uid) => {
  return lastMessage.sender.toString() === uid
    ? lastMessage.receiver
    : lastMessage.sender;
};

/**
 * Helper function to build conversation object
 * @param {Object} convo - Conversation object
 * @param {Object} lastMessage - Last message object
 * @param {Object} name - Other participant's user object
 * @param {string} uid - Current user ID
 * @returns {Object} - Formatted conversation object
 */
const buildConversationObject = (convo, lastMessage, name, uid) => {
  const nameID = getOtherParticipant(lastMessage, uid);

  return {
    userId: nameID,
    name: name.firstname + " " + name.lastname,
    lastMessage: {
      content: lastMessage.content,
      _id: lastMessage._id.toString(),
    },
    who: lastMessage.sender.toString() === uid ? "You:" : "",
    read:
      lastMessage.receiver.toString() === uid ? lastMessage.read : undefined,
    _id: convo._id.toString(),
    profilePicture: name.profilePicture === null ? "" : name.profilePicture,
    updatedAt: convo.updatedAt,
  };
};

/**
 * Helper function to check if conversation should be included
 * @param {Object} lastMessage - Last message object
 * @param {Object} convo - Conversation object
 * @param {string} uid - Current user ID
 * @returns {boolean} - Whether conversation should be included
 */
const shouldIncludeConversation = (lastMessage, convo, uid) => {
  return (
    (lastMessage.sender.toString() === uid &&
      (convo.status === "Pending" || convo.status === "Rejected")) ||
    convo.status === "Accepted"
  );
};

/**
 * Retrieves all conversations of a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The result containing the conversations.
 */
const getConversations = async (req, res) => {
  const uid = req.params.uid;

  try {
    // Get all conversations for the user
    const conversations = await Convo.find({
      participants: { $in: [uid] },
    }).sort({ updatedAt: -1 });

    if (conversations.length === 0) {
      return res.status(404).json({
        message: "No conversations found for this user.",
      });
    }

    // Process conversations in parallel
    const conversationPromises = conversations.map(async (convo) => {
      const lastMessage = await Message.findById(convo.lastMessage);

      if (!shouldIncludeConversation(lastMessage, convo, uid)) {
        return null;
      }

      const nameID = getOtherParticipant(lastMessage, uid);
      const name = await Users.findById(nameID).select(
        "firstname lastname profilePicture"
      );

      return buildConversationObject(convo, lastMessage, name, uid);
    });

    const results = await Promise.all(conversationPromises);
    const validResults = results.filter((result) => result !== null);

    res.status(200).json(validResults);
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ error: "Failed to retrieve conversations" });
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

/**
 * Emits a request event to the recipient but only if certain conditions are met. The user must be online and either the conversation
 * has been rejected or pending under a isNewConvo boolean flag which indicates that the conversation has newly been created.
 */
const emitnewRequestEvent = async (
  io,
  newConvo,
  message,
  sender,
  receiverID,
  isNewConvo
) => {
  if (searchActiveUsers(receiverID)) {
    for (const socket of getSocketsByUserId(receiverID)) {
      if (
        newConvo.status === "Rejected" ||
        (isNewConvo && newConvo.status === "Pending")
      ) {
        io.to(socket).emit("updateRequestsNumber"); // Makes the request count of the recipient's client side increment
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
          sender.profilePicture === null ? "" : sender.profilePicture,
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
            sender.profilePicture === null ? "" : sender.profilePicture,
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
              sender.profilePicture === null ? "" : sender.profilePicture,
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
      io.to(socket).emit("removeFromRequests", convoID);
    }
  } else {
    console.log("User is offline, there's no need to emit the event");
  }
};

/**
 * Helper function to find users by name
 * @param {string} userName2 - Full name of the user
 * @returns {Object} - User object
 */
const findUserByName = async (userName2) => {
  const user2Firstname = userName2.split(" ")[0];
  const user2Lastname = userName2.split(" ")[1];

  return await Users.findOne({
    firstname: user2Firstname,
    lastname: user2Lastname,
  });
};

/**
 * Helper function to handle existing conversation logic
 * @param {Object} convo - Conversation object
 * @param {Object} newMessage - New message object
 * @param {Object} sender - Sender user object
 * @param {Object} receiver - Receiver user object
 * @param {Object} io - Socket.IO instance
 * @returns {Object} - Updated conversation response
 */
const handleExistingConversation = async (
  convo,
  newMessage,
  sender,
  receiver,
  io
) => {
  const lastMessage = await Message.findById(convo.lastMessage);
  newMessage.conversation = convo._id;
  await newMessage.save();

  // Handle different conversation statuses
  if (convo.status === "Accepted") {
    convo.updatedAt = Date.now();
    emitRealTimeEvent(io, convo, newMessage, sender, receiver._id.toString());
  } else if (
    convo.status === "Pending" &&
    lastMessage.receiver.equals(sender._id)
  ) {
    convo.status = "Accepted";
    emitRealTimeEvent(io, convo, newMessage, sender, receiver._id.toString());
    emitRemoveFromRequestsEvent(
      io,
      convo._id.toString(),
      sender._id.toString()
    );
  } else if (
    (convo.status === "Pending" || convo.status === "Rejected") &&
    lastMessage.sender.equals(sender._id)
  ) {
    emitnewRequestEvent(
      io,
      convo,
      newMessage,
      sender,
      receiver._id.toString(),
      false
    );
  }

  await updateConversation(convo, newMessage);

  return {
    convoSender: {
      _id: convo._id.toString(),
      lastMessage: {
        content: newMessage.content,
        _id: newMessage._id.toString(),
      },
      name: receiver.firstname + " " + receiver.lastname,
      profilePicture:
        receiver.profilePicture === null ? "" : receiver.profilePicture,
      updatedAt: convo.updatedAt,
      userId: receiver._id.toString(),
      who: "You:",
    },
  };
};

/**
 * Helper function to handle new conversation creation
 * @param {Array} participants - Array of participant IDs
 * @param {Object} newMessage - New message object
 * @param {Object} sender - Sender user object
 * @param {Object} receiver - Receiver user object
 * @param {Object} io - Socket.IO instance
 * @returns {Object} - New conversation response
 */
const handleNewConversation = async (
  participants,
  newMessage,
  sender,
  receiver,
  io
) => {
  const newConvo = await createConversation(participants, newMessage._id);
  newMessage.conversation = newConvo._id;
  await newMessage.save();

  emitnewRequestEvent(
    io,
    newConvo,
    newMessage,
    sender,
    receiver._id.toString(),
    true
  );

  return {
    convoSender: {
      _id: newConvo._id.toString(),
      lastMessage: {
        content: newMessage.content,
        _id: newMessage._id.toString(),
      },
      name: receiver.firstname + " " + receiver.lastname,
      profilePicture:
        receiver.profilePicture === null ? "" : receiver.profilePicture,
      updatedAt: newConvo.updatedAt,
      userId: receiver._id.toString(),
      who: "You:",
    },
  };
};

/**
 * Creates a new conversation or updates an existing one
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} io - Socket.IO instance
 */
const createConvo = async (req, res, io) => {
  const { userID1, userName2, message } = req.body;

  try {
    // Find users
    const [receiver, sender] = await Promise.all([
      findUserByName(userName2),
      Users.findById(userID1),
    ]);

    if (!receiver || !sender) {
      return res.status(404).json({ error: "User not found" });
    }

    const participants = [sender._id, receiver._id];
    const convo = await Convo.findOne({ participants: { $all: participants } });
    const newMessage = await createMessage(message, sender._id, receiver._id);

    let response;
    if (convo) {
      response = await handleExistingConversation(
        convo,
        newMessage,
        sender,
        receiver,
        io
      );
    } else {
      response = await handleNewConversation(
        participants,
        newMessage,
        sender,
        receiver,
        io
      );
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in createConvo:", error);
    res.status(500).json({ error: "Failed to create conversation" });
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
      .sort({ timestamp: -1 })
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
      .sort({ timestamp: -1 })
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
