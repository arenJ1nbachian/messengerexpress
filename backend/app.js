const express = require("express");
const usersRoutes = require("./routes/users-routes");
const messagesRoutes = require("./routes/messages-routes");
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
const {
  addUserSocket,
  removeUserSocket,
  getSocketsByUserId,
  setNewUserSocket,
  deleteUserSocket,
  getOfflineNotificationTimeoutByUserId,
  deleteOfflineNotificationTimeoutByUserId,
  searchActiveUsers,
  addActiveUser,
  setOfflineNotificationTimeout,
  deleteActiveUser,
} = require("./userOnlineStatus");

const io = new Server(server, {
  pingTimeout: 3000,
  pingInterval: 1000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const usersTyping = {};

app.use(express.json());

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.uid;

  if (userId) {
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // 1. Clear any pending 'userOffline' timeout
    // This happens when a user reconnects quickly (e.g., page refresh or F5 spamming or for any other reason).
    if (getOfflineNotificationTimeoutByUserId(userId)) {
      clearTimeout(getOfflineNotificationTimeoutByUserId(userId));
      deleteOfflineNotificationTimeoutByUserId(userId);
    }

    // 2. Update userSocketMap to track this user's socket
    // Initialize a new Set for sockets if this is the first connection for the user.
    if (!getSocketsByUserId(userId)) {
      setNewUserSocket(userId);
    }
    addUserSocket(userId, socket.id); // Add the new socketId to the Set

    // 3. Notify other users that this user is online
    // Only broadcast "userOnline" if the user is not already marked as online.
    if (!searchActiveUsers(userId)) {
      addActiveUser(userId); // Add the user to the active users Set
      console.log(`Marking ${userId} as online`);

      try {
        // Update the user's status in the database
        await Users.findByIdAndUpdate(userId, {
          onlineStatus: { status: true, lastSeen: Date.now() },
        });

        // Get the list of users who should be notified (shared conversations)
        const data = await getOnline(null, null, userId);
        const userOnline = await getUserInfo(null, null, userId);
        const userProfilePicture = await getUserPicture(null, null, userId);

        // Notify relevant users (those who share conversations with this user)
        data.forEach((onlineUser) => {
          const recipientSockets = getSocketsByUserId(onlineUser.userId); // Get recipient socketIds
          recipientSockets.forEach((recipientSocketId) => {
            socket.to(recipientSocketId).emit("userOnline", {
              userId: userId,
              convoId: onlineUser.convoId,
              firstname: userOnline.firstname,
              lastname: userOnline.lastname,
              profilePicture: userProfilePicture,
            });
          });
        });
      } catch (err) {
        console.error("Error sending userOnline event:", err);
      }
    }
  }

  // Handle Socket.IO 'disconnect' event
  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected with socket ${socket.id}`);

    // Remove the socketId from the user's Set of active sockets
    if (getSocketsByUserId(userId)) {
      removeUserSocket(userId, socket.id);

      // If no sockets remain for this user, prepare to mark them offline
      if (getSocketsByUserId(userId).size === 0) {
        deleteUserSocket(userId); // Clean up the socket map for this user

        // Start a timeout to debounce the offline event
        setOfflineNotificationTimeout(userId, async () => {
          if (searchActiveUsers(userId)) {
            deleteActiveUser(userId); // Remove user from active users
            console.log(`Marking ${userId} as offline`);

            try {
              // Update the user's status to offline in the database
              await logoutUser(userId);
              const onlineUsers = await getOnline(null, null, userId);

              // Notify relevant users that this user is now offline
              onlineUsers.forEach((onlineUser) => {
                const recipientSockets = getSocketsByUserId(onlineUser.userId);
                recipientSockets.forEach((recipientSocketId) => {
                  socket.to(recipientSocketId).emit("userOffline", userId);
                });
              });
            } catch (err) {
              console.error("Error sending userOffline event:", err);
            }
          }
          deleteOfflineNotificationTimeoutByUserId(userId); // Clean up the timeout
        });
      }
    }
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
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
    for (const socketId of getSocketsByUserId(userId)) {
      socket
        .to(socketId)
        .emit("requestJoinConversation", { conversationId, convo });
    }
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
app.use("/api/messages", messagesRoutes);
app.use("/api/conversations", convoRoutes(io));

mongoose
  .connect("mongodb://localhost:27017/")
  .then(() => {
    server.listen(5000, () => {
      console.log("Server running on http://localhost:5000\n\n");
    });
  })
  .catch((err) => console.log(err));
