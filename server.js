require("./config/db");

const express = require("express");
const bodyParser = require("express").json;

const app = express();
const port = process.env.PORT || 3000;

const userRouter = require("./api/User");

app.use(bodyParser());
app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
