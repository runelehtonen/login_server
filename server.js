// mongodb
require("./config/db");

const app = require("express")();
const port = process.env.PORT || 3000;

const UserRouter = require("./api/User");

// For accepting json data in the request body
const bodyParser = require("express").json;
app.use(bodyParser());

// Routes
app.use("/user", UserRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
