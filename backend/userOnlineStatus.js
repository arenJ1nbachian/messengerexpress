const userSocketMap = {};

// Track timeouts for sending user offline notifications
const offlineNotificationTimeout = {};

// A Set to track active users marked as "online"
const activeUsers = new Set();

const addActiveUser = (userId) => {
  activeUsers.add(userId);
};

const searchActiveUsers = (userId) => {
  return activeUsers.has(userId);
};

const deleteActiveUser = (userId) => {
  activeUsers.delete(userId);
};

const getOfflineNotificationTimeoutByUserId = (userId) => {
  return offlineNotificationTimeout[userId];
};

const setOfflineNotificationTimeout = (userId, timeout) => {
  offlineNotificationTimeout[userId] = setTimeout(timeout, 2000);
};

const deleteOfflineNotificationTimeoutByUserId = (userId) => {
  delete offlineNotificationTimeout[userId];
};

const addUserSocket = (userId, socketId) => {
  userSocketMap[userId].add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  userSocketMap[userId].delete(socketId);
};

const getSocketsByUserId = (userId) => {
  return userSocketMap[userId];
};

const setNewUserSocket = (userId) => {
  userSocketMap[userId] = new Set();
};

const deleteUserSocket = (userId) => {
  delete userSocketMap[userId];
};

module.exports = {
  addUserSocket,
  removeUserSocket,
  getSocketsByUserId,
  setNewUserSocket,
  deleteUserSocket,
  getOfflineNotificationTimeoutByUserId,
  deleteOfflineNotificationTimeoutByUserId,
  setOfflineNotificationTimeout,
  searchActiveUsers,
  addActiveUser,
  deleteActiveUser,
};
