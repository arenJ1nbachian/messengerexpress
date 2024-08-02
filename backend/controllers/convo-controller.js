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
      const name = await Users.findById(nameID).select("firstname lastname");

      result.push({
        name: name.firstname + " " + name.lastname,
        lastMessage: lastMessage.content,
        who: lastMessage.sender.toString() === uid ? "You:" : "",
      });
    }

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const createConvo = async (req, res) => {
  const { userID1, userName2, message } = req.body;
  const user2Firstname = userName2.split(" ")[0];
  const user2Lastname = userName2.split(" ")[1];

  try {
    const user2 = await Users.findOne({
      firstname: user2Firstname,
      lastname: user2Lastname,
    });

    const participants = [userID1, user2._id];

    const existingConvo = await Convo.findOne({ participants });

    if (existingConvo) {
      return res.status(200).json({ existingConvo });
    } else {
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
