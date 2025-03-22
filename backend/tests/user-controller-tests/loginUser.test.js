const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Users = require("../../models/user");
const { loginUser } = require("../../controllers/users-controller");

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

test("logs in user with correct credentials", async () => {
  const user = await Users.create({
    firstname: "Test",
    lastname: "User",
    email: "test@example.com",
    password: "mypassword",
  });

  let responseData;
  const req = { body: { email: "test@example.com", password: "mypassword" } };
  const res = {
    status: () => ({
      json: (data) => {
        responseData = data;
      },
    }),
  };

  await loginUser(req, res);

  expect(responseData).toHaveProperty("token");
  expect(responseData).toHaveProperty("userId");
});

test("fails login with wrong password", async () => {
  await Users.create({
    firstname: "Wrong",
    lastname: "Pass",
    email: "wrong@example.com",
    password: "correctpass",
  });

  let responseData;
  const req = { body: { email: "wrong@example.com", password: "wrongpass" } };
  const res = {
    status: (code) => ({
      json: (data) => {
        responseData = { code, ...data };
      },
    }),
  };

  await loginUser(req, res);

  expect(responseData.code).toBe(401);
  expect(responseData.error).toBe("Invalid credentials");
});

test("fails login if user not found", async () => {
  let responseData;
  const req = {
    body: { email: "nonexistent@example.com", password: "anything" },
  };
  const res = {
    status: (code) => ({
      json: (data) => {
        responseData = { code, ...data };
      },
    }),
  };

  await loginUser(req, res);

  expect(responseData.code).toBe(404);
  expect(responseData.error).toBe("User not found");
});
