const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  ],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Messages" },
  updatedAt: { type: Date, default: Date.now },
});

conversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Conversations", conversationSchema);
