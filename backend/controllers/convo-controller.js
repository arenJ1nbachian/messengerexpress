const Convo = require("../models/conversation");
const Message = require("../models/message");
const Users = require("../models/user");

const getConversations = async (req, res) => {
  const uid = req.params.uid;
  const result = [];
  try {
    const conversations = await Convo.find({ participants: { $in: [uid] } });

    if (conversations.length === 0) {
      return res
        .status(404)
        .json({ message: "No conversations found for this user." });
    }

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const lastMessage = await Message.findById(convo.lastMessage);
      const nameID =
        lastMessage.sender.toString() === uid
          ? lastMessage.receiver
          : lastMessage.sender;
      const name = await Users.findById(nameID).select(
        "firstname lastname profilePicture"
      );

      result.push({
        userId: nameID,
        name: name.firstname + " " + name.lastname,
        lastMessage: lastMessage.content,
        who: lastMessage.sender.toString() === uid ? "You:" : "",
        read: lastMessage.read,
        _id: convo._id,
        profilePicture:
          name.profilePicture === null
            ? ""
            : "http://localhost:5000/" + name.profilePicture,
      });
    }

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const createConvo = async (req, res, io) => {
  const { userID1, userName2, message } = req.body;
  const user2Firstname = userName2.split(" ")[0];
  const user2Lastname = userName2.split(" ")[1];

  try {
    const user2 = await Users.findOne({
      firstname: user2Firstname,
      lastname: user2Lastname,
    });

    const participants = [userID1, user2._id.toString()].sort();
    console.log("Participants: ", participants);

    const existingConvo = await Convo.findOne({
      participants: { $all: participants },
    });

    if (existingConvo) {
      console.log("Updating existing convo");
      const newMessage = new Message({
        sender: userID1,
        receiver: user2._id,
        content: message,
      });
      console.log("New message: ", newMessage);
      await newMessage.save();

      existingConvo.lastMessage = newMessage._id;
      existingConvo.updatedAt = Date.now();
      await existingConvo.save();

      participants.forEach((participantId) => {
        io.to(existingConvo._id.toString()).emit("updateConversationHeader", {
          conversationId: existingConvo._id.toString(),
          lastMessage: newMessage.content,
          timestamp: existingConvo.updatedAt,
          sender: userID1,
        });
        console.log("Emitting updateConversationHeader to", participantId);
      });

      return res.status(200).json({ existingConvo });
    } else {
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

        participants.forEach((participantId) => {
          io.emit("updateConversationHeader", {
            conversationId: newConvo._id.toString(),
            lastMessage: newMessage.content,
            timestamp: newConvo.updatedAt,
          });
        });

        res.status(201).json({ newConvo });
      } else {
        res.status(204).json({ message: "No message provided." });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getConvo = async (req, res) => {
  const { convoID } = req.body;
  try {
    const convo = await Convo.findById(convoID);
    res.status(200).json({ convo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

exports.getConversations = getConversations;
exports.createConvo = createConvo;
exports.getConvo = getConvo;
