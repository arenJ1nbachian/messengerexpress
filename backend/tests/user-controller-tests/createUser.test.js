const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Users = require("../../models/user");

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
  jest.resetModules();
});

test("creates user successfully with valid data", async () => {
  jest.doMock("express-validator", () => ({
    validationResult: () => ({
      isEmpty: () => true,
      array: () => [],
    }),
  }));

  const { createUser } = require("../../controllers/users-controller");

  const req = {
    body: {
      firstname: "Aren",
      lastname: "J",
      email: "aren@example.com",
      password: "123456",
    },
    file: { path: "uploads/aren.jpg" },
  };

  let responseData;
  const res = {
    status: () => ({
      json: (data) => {
        responseData = data;
      },
    }),
  };

  await createUser(req, res);

  expect(responseData.user).toBeDefined();
  expect(responseData.user.firstname).toBe("Aren");
  expect(responseData.user.profilePicture).toBe("uploads/aren.jpg");
});

test("fails to create user if validation fails", async () => {
  jest.doMock("express-validator", () => ({
    validationResult: () => ({
      isEmpty: () => false,
      array: () => [{ msg: "Missing fields" }],
    }),
  }));

  const { createUser } = require("../../controllers/users-controller");

  const req = {
    body: {},
    file: null,
  };

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

  await createUser(req, res);

  expect(capturedStatus).toBe(422);
  expect(capturedJson.errors).toBeDefined();
  expect(Array.isArray(capturedJson.errors)).toBe(true);
});
