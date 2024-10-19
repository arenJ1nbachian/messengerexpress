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
const { getOnline } = require("./controllers/users-controller");
const { getUserInfo } = require("./controllers/users-controller");
const { getUserPicture } = require("./controllers/users-controller");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const userSocketMap = {};

const userLogoutTimeout = {};

const usersTyping = {};

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

  const data = await getOnline(null, null, userId);
  const userOnline = await getUserInfo(null, null, userId);
  const userProfilePicture = await getUserPicture(null, null, userId);
  console.log("data", data);
  console.log("userOnline", userOnline);

  console.log(userOnline, userProfilePicture);
  if (userLogoutTimeout[userId]) {
    clearTimeout(userLogoutTimeout[userId]);
    delete userLogoutTimeout[userId];
  } else {
    data.forEach((onlineUser, index) => {
      socket.to(userSocketMap[onlineUser.userId]).emit("userOnline", {
        convoId: data[index].convoId,
        firstname: userOnline.firstname,
        lastname: userOnline.lastname,
        profilePicture: userProfilePicture,
      });
    });
  }

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(
      `Socket ${socket.id} joined conversation room ${conversationId}`
    );
    if (usersTyping[conversationId]) {
      usersTyping[conversationId].forEach((typingUserId) => {
        if (typingUserId !== userId) {
          socket.emit(`typing_${conversationId}`, {
            conversationId,
            isTyping: true,
            sender: typingUserId,
          });
        }
      });
    }
  });

  socket.on("requestJoinConversation", (userId, conversationId, convo) => {
    console.log("Sending request to the recipient", convo);
    io.emit("requestJoinConversation", { userId, conversationId, convo });
  });

  socket.on("typing", (data) => {
    console.log(data);

    if (!usersTyping[data.conversationId]) {
      usersTyping[data.conversationId] = new Set();
    }

    if (data.isTyping) {
      usersTyping[data.conversationId].add(data.sender);
    } else {
      usersTyping[data.conversationId].delete(data.sender);
      if (usersTyping[data.conversationId].size === 0) {
        delete usersTyping[data.conversationId];
      }
    }

    socket.to(data.conversationId).emit(`typing_${data.conversationId}`, data);
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);

    for (const [conversationId, typingUsers] of Object.entries(usersTyping)) {
      if (typingUsers.has(userId)) {
        typingUsers.delete(userId);
        if (typingUsers.size === 0) {
          delete usersTyping[conversationId];
        }
        socket.to(conversationId).emit(`typing_${conversationId}`, {
          conversationId,
          isTyping: false,
          sender: userId,
        });
      }
    }

    try {
      await logoutUser(userId);
      userLogoutTimeout[userId] = setTimeout(async () => {
        const data = await getOnline(null, null, userId);
        console.log("User logged out", data);
        data.forEach((onlineUser) => {
          console.log("Socket to send a " + userSocketMap[onlineUser.userId]);
          socket
            .to(userSocketMap[onlineUser.userId])
            .emit("userOffline", userId);
        });
        delete userLogoutTimeout[userId];
      }, 2000);
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
