const express = require("express");
const usersRoutes = require("./routes/users-routes");
const convoRoutes = require("./routes/convo-routes");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const http = require("http");
const Users = require("./models/user");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { logoutUser } = require("./controllers/users-controller");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const userSocketMap = {};

app.use(express.json());

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.uid;

  try {
    await Users.findByIdAndUpdate(userId, {
      onlineStatus: { status: true, lastSeen: Date.now() },
    });
  } catch (err) {
    console.log(err);
  }

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(
      `Socket ${socket.id} joined conversation room ${conversationId}`
    );
  });

  socket.on("requestJoinConversation", (userId, conversationId, convo) => {
    console.log("Sending request to the recipient", convo);
    io.emit("requestJoinConversation", { userId, conversationId, convo });
  });

  socket.on("typing", (data) => {
    console.log(data);
    socket.to(data.conversationId).emit(`typing_${data.conversationId}`, data);
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
    try {
      await logoutUser(userId);
    } catch (error) {
      console.log(error);
    }

    delete userSocketMap[userId];
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/conversations", convoRoutes(io));

mongoose
  .connect("mongodb://localhost:27017/")
  .then(() => {
    server.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((err) => console.log(err));
