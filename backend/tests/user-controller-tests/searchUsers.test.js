const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Users = require("../../models/user");
const { searchUsers } = require("../../controllers/users-controller");

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

test("searches users by first or last name and filters out the requester", async () => {
  // Create 3 users
  const user1 = await Users.create({
    firstname: "John",
    lastname: "Smith",
    email: "js@example.com",
    password: "123",
    profilePicture: "john.jpg",
  });

  const user2 = await Users.create({
    firstname: "Joanna",
    lastname: "Doe",
    email: "jo@example.com",
    password: "123",
    profilePicture: "jo.jpg",
  });

  const requester = await Users.create({
    firstname: "You",
    lastname: "Person",
    email: "you@example.com",
    password: "123",
    profilePicture: "you.jpg",
  });

  const req = {
    params: { searchString: "Jo Sm" },
    body: { userId: requester._id.toString() },
  };

  let responseData;
  const res = {
    status: () => ({
      json: (data) => {
        responseData = data;
      },
    }),
  };

  await searchUsers(req, res);

  expect(responseData.result).toHaveLength(2);
  expect(responseData.result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ firstname: "John", lastname: "Smith" }),
      expect.objectContaining({ firstname: "Joanna", lastname: "Doe" }),
    ])
  );
});
