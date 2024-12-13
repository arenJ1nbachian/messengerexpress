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

  if (userLogoutTimeout[userId] && userSocketMap?.[userId]?.length > 0) {
    console.log(
      "The delay for logging out the user has been cleared. The user probably reconnected after disconnecting from the socket."
    );
    clearTimeout(userLogoutTimeout[userId]);
    delete userLogoutTimeout[userId];
  }
  if (!userSocketMap[userId]) {
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

    const data = await getOnline(null, null, userId);
    const userOnline = await getUserInfo(null, null, userId);
    const userProfilePicture = await getUserPicture(null, null, userId);

    console.log("This user has interacted with the following users: ", data);

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
      if (usersTyping[data.conversationId].length === 0) {
        delete usersTyping[data.conversationId];
      }
    }

    socket.to(data.conversationId).emit(`typing_${data.conversationId}`, data);
  });

  socket.on("disconnect", async () => {
    for (const [conversationId, typingUsers] of Object.entries(usersTyping)) {
      if (typingUsers.has(userId)) {
        typingUsers.delete(userId);
        if (typingUsers.length === 0) {
          delete usersTyping[conversationId];
        }
        io.to(conversationId).emit(`typing_${conversationId}`, {
          conversationId,
          isTyping: false,
          sender: userId,
        });
      }
    }

    userLogoutTimeout[userId] = setTimeout(async () => {
      if (userSocketMap?.[userId]?.length > 0) {
        try {
          await logoutUser(userId);
          const data = await getOnline(null, null, userId);

          data.forEach((onlineUser) => {
            socket
              .to(userSocketMap[onlineUser.userId])
              .emit("userOffline", userId);
          });
          delete userSocketMap[userId];
        } catch (error) {
          console.log(error);
        }
      }
    }, 2000);
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
