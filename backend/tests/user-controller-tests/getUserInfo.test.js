const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Users = require("../../models/user");
const { getUserInfo } = require("../../controllers/users-controller");

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

test("returns user info when user exists", async () => {
  const user = await Users.create({
    firstname: "Test",
    lastname: "User",
    email: "test@example.com",
    password: "123456",
  });

  const result = await getUserInfo(null, null, user._id.toString());

  expect(result.firstname).toBe("Test");
  expect(result.lastname).toBe("User");
});

test("returns null when user does not exist", async () => {
  const nonExistentId = new mongoose.Types.ObjectId();

  const result = await getUserInfo(null, null, nonExistentId.toString());

  expect(result).toBeNull();
});

test("sends user info via res when res object is provided", async () => {
  const user = await Users.create({
    firstname: "Test",
    lastname: "User",
    email: "test@example.com",
    password: "123456",
  });

  const req = { params: { uid: user._id.toString() } };

  const jsonMock = jest.fn();
  const res = {
    status: jest.fn(() => ({
      json: jsonMock,
    })),
  };

  await getUserInfo(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(jsonMock).toHaveBeenCalledWith({
    userDetails: expect.objectContaining({
      firstname: "Test",
      lastname: "User",
    }),
  });
});
