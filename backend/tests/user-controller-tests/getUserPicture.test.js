const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Users = require("../../models/user");
const { getUserPicture } = require("../../controllers/users-controller");
const path = require("path");

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

test("sends profile picture file if it exists", async () => {
  const user = await Users.create({
    firstname: "Pic",
    lastname: "Holder",
    email: "pic@example.com",
    password: "123",
    profilePicture: "uploads/pic.jpg",
  });

  const req = { params: { uid: user._id.toString() } };

  const res = {
    sendFile: jest.fn(),
  };

  await getUserPicture(req, res);

  expect(res.sendFile).toHaveBeenCalledWith(
    path.join(__dirname, "..\\", "uploads/pic.jpg")
  );
});

test("returns 404 if profile picture is null", async () => {
  const user = await Users.create({
    firstname: "No",
    lastname: "Pic",
    email: "nop@example.com",
    password: "123",
    profilePicture: null,
  });

  const req = { params: { uid: user._id.toString() } };

  let capturedStatus = null;
  let capturedJson = null;

  const res = {
    status: (code) => {
      capturedStatus = code;
      return {
        json: (data) => {
          capturedJson = data;
        },
      };
    },
  };

  await getUserPicture(req, res);

  expect(capturedStatus).toBe(404);
  expect(capturedJson.error).toBe("Profile picture not found");
});

test("returns profile picture path", async () => {
  const user = await Users.create({
    firstname: "No",
    lastname: "Pic",
    email: "nop@example.com",
    password: "123",
    profilePicture: "uploads\\1724180674709.jpg",
  });

  const result = await getUserPicture(null, null, user._id.toString());

  expect(result).toBe("http://localhost:5000\\uploads\\1724180674709.jpg");
});
