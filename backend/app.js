const express = require("express");
const usersRoutes = require("./routes/users-routes");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/users", usersRoutes);

mongoose
  .connect("mongodb://localhost:27017/")
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
