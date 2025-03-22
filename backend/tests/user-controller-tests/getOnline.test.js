const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Users = require("../../models/user");
const Conversations = require("../../models/conversation");
const Messages = require("../../models/message");
const { getOnline } = require("../../controllers/users-controller");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Users.deleteMany({});
  await Conversations.deleteMany({});
  await Messages.deleteMany({});
});

test("getOnline returns online users in accepted conversations", async () => {
  const onlineUser = await Users.create({
    firstname: "Online",
    lastname: "User",
    email: "online@example.com",
    password: "123",
    profilePicture: "online.jpg",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  const targetUser = await Users.create({
    firstname: "You",
    lastname: "User",
    email: "you@example.com",
    password: "123",
    profilePicture: "you.jpg",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  const msg = await Messages.create({
    sender: onlineUser._id,
    receiver: targetUser._id,
    content: "Hello",
    read: true,
  });

  await Conversations.create({
    participants: [onlineUser._id, targetUser._id],
    lastMessage: msg._id,
    status: "Accepted",
  });

  const result = await getOnline(null, null, targetUser._id.toString());

  expect(result).toHaveLength(1);
  expect(result[0]).toHaveProperty("firstname", "Online");
});

test("returns empty list when the other user is offline", async () => {
  const offlineUser = await Users.create({
    firstname: "Offline",
    lastname: "User",
    email: "offline@example.com",
    password: "123",
    profilePicture: "offline.jpg",
    onlineStatus: { status: false, lastSeen: Date.now() },
  });

  const currentUser = await Users.create({
    firstname: "You",
    lastname: "User",
    email: "you@example.com",
    password: "123",
    profilePicture: "you.jpg",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  const msg = await Messages.create({
    sender: offlineUser._id,
    receiver: currentUser._id,
    content: "Hi",
    read: false,
  });

  await Conversations.create({
    participants: [offlineUser._id, currentUser._id],
    lastMessage: msg._id,
    status: "Accepted",
  });

  const result = await getOnline(null, null, currentUser._id.toString());

  expect(result).toEqual([]);
});

test("does not return users from pending conversations", async () => {
  const userA = await Users.create({
    firstname: "Pending",
    lastname: "User",
    email: "pending@example.com",
    password: "123",
    profilePicture: "pending.jpg",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  const userB = await Users.create({
    firstname: "You",
    lastname: "User",
    email: "you@example.com",
    password: "123",
    profilePicture: "you.jpg",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  const msg = await Messages.create({
    sender: userA._id,
    receiver: userB._id,
    content: "Hello there",
    read: true,
  });

  await Conversations.create({
    participants: [userA._id, userB._id],
    lastMessage: msg._id,
    status: "Pending",
  });

  const result = await getOnline(null, null, userB._id.toString());

  expect(result).toEqual([]);
});

test("sends usersInteracted through res if res is provided", async () => {
  const userA = await Users.create({
    firstname: "Tester",
    lastname: "A",
    email: "a@example.com",
    password: "pass",
    profilePicture: "a.jpg",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  const userB = await Users.create({
    firstname: "Tester",
    lastname: "B",
    email: "b@example.com",
    password: "pass",
    profilePicture: "b.jpg",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  const msg = await Messages.create({
    sender: userB._id,
    receiver: userA._id,
    content: "Hi",
    read: true,
  });

  await Conversations.create({
    participants: [userA._id, userB._id],
    lastMessage: msg._id,
    status: "Accepted",
  });

  const req = { body: { userId: userA._id.toString() } };

  const jsonMock = jest.fn();
  const res = {
    status: jest.fn(() => ({
      json: jsonMock,
    })),
  };

  await getOnline(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(jsonMock).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        userId: userB._id,
        firstname: "Tester",
      }),
    ])
  );
});
