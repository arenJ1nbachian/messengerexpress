const express = require("express");
const usersRoutes = require("./routes/users-routes");
const convoRoutes = require("./routes/convo-routes");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

app.use(express.json());

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

app.use("/api/conversations", convoRoutes);

mongoose
  .connect("mongodb://localhost:27017/")
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
