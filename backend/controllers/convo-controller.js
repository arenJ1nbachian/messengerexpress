const { mongoose } = require("mongoose");
const Convo = require("../models/conversation");
const Message = require("../models/message");
const Users = require("../models/user");

/**
 * Retrieves all conversations of a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The result containing the conversations.
 */
const getConversations = async (req, res) => {
  // Get the user's ID from the request parameters.
  const uid = req.params.uid;
  const result = [];

  try {
    // Find all conversations where the user is a participant.
    const conversations = await Convo.find({
      participants: { $in: [uid] },
    }).sort({ updatedAt: -1 });

    // If no conversations are found, return a 404 error.
    if (conversations.length === 0) {
      return res
        .status(404)
        .json({ message: "No conversations found for this user." });
    }

    // Iterate over each conversation.
    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];

      // Find the last message in the conversation.
      const lastMessage = await Message.findById(convo.lastMessage);

      // Determine the name and profile picture of the other participant.
      const nameID =
        lastMessage.sender.toString() === uid
          ? lastMessage.receiver
          : lastMessage.sender;
      const name = await Users.findById(nameID).select(
        "firstname lastname profilePicture"
      );

      // Prepare the result object for the conversation.
      result.push({
        userId: nameID, // The ID of the other participant.
        name: name.firstname + " " + name.lastname, // The full name of the other participant.
        lastMessage: lastMessage.content, // The content of the last message.
        who: lastMessage.sender.toString() === uid ? "You:" : "", // Indicates whether the user is the sender of the last message.
        read: lastMessage.read, // Indicates whether the user has read the last message.
        _id: convo._id, // The ID of the conversation.
        profilePicture:
          name.profilePicture === null
            ? ""
            : "http://localhost:5000/" + name.profilePicture, // The URL of the other participant's profile picture.
      });
    }

    // Return the result containing the conversations.
    res.status(200).json({ result });
  } catch (error) {
    // If an error occurs, log it and return a 500 error.
    console.log(error);
    res.status(500).json({ error });
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
    const user2 = await Users.findOne({
      firstname: user2Firstname,
      lastname: user2Lastname,
    });

    const user1 = await Users.findOne({
      _id: new mongoose.Types.ObjectId(userID1),
    });

    const participants = [userID1, user2._id.toString()].sort();
    console.log("Participants: ", participants);

    const existingConvo = await Convo.findOne({
      participants: { $all: participants },
    });

    if (existingConvo) {
      // Update existing conversation
      console.log("Updating existing convo");

      const newMessage = new Message({
        sender: userID1,
        receiver: user2._id,
        content: message,
        read: false,
      });
      console.log("New message: ", newMessage);
      await newMessage.save();

      existingConvo.lastMessage = newMessage._id;
      existingConvo.updatedAt = Date.now();
      await existingConvo.save();

      // Emit updateConversationHeader to all participants

      io.to(existingConvo._id.toString()).emit(
        `updateConversationHeader_${existingConvo._id.toString()}`,
        {
          conversationId: existingConvo._id.toString(),
          lastMessage: newMessage.content,
          timestamp: existingConvo.updatedAt,
          sender: userID1,
          new: false,
        }
      );
      console.log("Emitting updateConversationHeader to");

      return res.status(200).json({ existingConvo, new: false });
    } else {
      // Create new conversation
      console.log("Creating new convo");

      if (message) {
        const newMessage = new Message({
          sender: userID1,
          receiver: user2._id,
          content: message,
        });
        await newMessage.save();
        const newConvo = new Convo({
          participants,
          lastMessage: newMessage._id,
        });
        await newConvo.save();

        res.status(201).json({
          convoSender: {
            userId: user2._id.toString(),
            name: userName2,
            lastMessage: message,
            who: "You:",
            read: newMessage.read,
            _id: newConvo._id.toString(),
            profilePicture:
              user2.profilePicture === null
                ? ""
                : "http://localhost:5000/" + user2.profilePicture,
          },
          convoRecipient: {
            userId: userID1,
            name: user1.firstname + " " + user1.lastname,
            lastMessage: message,
            who: "",
            read: newMessage.read,
            _id: newConvo._id.toString(),
            profilePicture:
              user1.profilePicture === null
                ? ""
                : "http://localhost:5000/" + user1.profilePicture,
          },
          new: true,
        });
      } else {
        res.status(204).json({ message: "No message provided." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
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
