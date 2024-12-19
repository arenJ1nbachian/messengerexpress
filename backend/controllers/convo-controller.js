const { mongoose, get } = require("mongoose");
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
  const result = [];

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

      // Construct the result object for each conversation.
      result.push({
        userId: nameID, // The ID of the other participant.
        name: name.firstname + " " + name.lastname, // The full name of the other participant.
        lastMessage: lastMessage.content, // The content of the last message.
        who: lastMessage.sender.toString() === uid ? "You:" : "", // Indicates if the user is the sender.
        read:
          lastMessage.receiver.toString() === uid
            ? lastMessage.read
            : undefined, // Indicates if the last message is read.
        _id: convo._id, // The ID of the conversation.
        profilePicture:
          name.profilePicture === null
            ? ""
            : "http://localhost:5000/" + name.profilePicture, // URL of the other participant's profile picture.
        updatedAt: convo.updatedAt, // The timestamp of the last update.
      });
    }

    // Respond with the list of conversations.
    res.status(200).json({ result });
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
    await convo.save();
    return convo;
  } catch (error) {
    console.log(error);
  }
};

const createMessage = async (message, senderId, receiverId) => {
  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: message,
      read: false,
    });
    await newMessage.save();
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

const emitRealTimeEvent = (io, convo, newMessage, sender, receiverID) => {
  if (searchActiveUsers(receiverID)) {
    console.log(getSocketsByUserId(receiverID));
    for (const socket of getSocketsByUserId(receiverID)) {
      io.to(socket).emit(`updateConversationHeader`, {
        convoReceiver: {
          _id: convo._id.toString(),
          lastMessage: newMessage.content,
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
      updateConversation(convo, newMessage);
      emitRealTimeEvent(io, convo, newMessage, sender, receiver._id.toString());

      res.status(201).json({
        convoSender: {
          _id: convo._id.toString(),
          lastMessage: newMessage.content,
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

      res.status(201).json({
        convoSender: {
          _id: newConvo._id.toString(),
          lastMessage: newMessage.content,
          name: receiver.firstname + " " + receiver.lastname,
          profilePicture:
            receiver.profilePicture === null
              ? ""
              : "http://localhost:5000/" + receiver.profilePicture,
          read: true,
          updatedAt: newConvo.updatedAt,
          userId: receiver._id.toString(),
          who: "You:",
        },
        convoReceiver: {
          _id: newConvo._id.toString(),
          lastMessage: newMessage.content,
          name: sender.firstname + " " + sender.lastname,
          profilePicture:
            sender.profilePicture === null
              ? ""
              : "http://localhost:5000/" + sender.profilePicture,
          read: newMessage.read,
          updatedAt: newConvo.updatedAt,
          userId: sender._id.toString(),
          who: "",
        },
      });
    }
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

exports.getConversations = getConversations;
exports.createConvo = createConvo;
exports.getConvo = getConvo;
exports.convoRead = convoRead;
exports.getMessageRead = getMessageRead;
