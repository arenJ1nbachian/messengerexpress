const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversations" },
});

messageSchema.index({ conversation: 1, timestamp: -1, _id: -1 });

module.exports = mongoose.model("Messages", messageSchema);
