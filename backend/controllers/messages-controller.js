const Message = require("../models/message");

const getMessage = async (req, res) => {
  const { messageID } = req.params;
  try {
    const message = await Message.findById(messageID);
    res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

module.exports = { getMessage };
