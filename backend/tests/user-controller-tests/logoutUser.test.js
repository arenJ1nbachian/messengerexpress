const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Users = require("../../models/user");
const { logoutUser } = require("../../controllers/users-controller");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Users.deleteMany({});
});

test("sets onlineStatus to false and updates lastSeen", async () => {
  const user = await Users.create({
    firstname: "Log",
    lastname: "Out",
    email: "logout@example.com",
    password: "123",
    onlineStatus: { status: true, lastSeen: Date.now() },
  });

  await logoutUser(user._id.toString());

  const updatedUser = await Users.findById(user._id);

  expect(updatedUser.onlineStatus.status).toBe(false);
  expect(typeof updatedUser.onlineStatus.lastSeen).toBe("number");
  expect(new Date(updatedUser.onlineStatus.lastSeen).toString()).not.toBe(
    "Invalid Date"
  );
});
