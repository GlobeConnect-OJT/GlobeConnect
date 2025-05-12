const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const connectDB = require("./util/connectDb");
const authRoute = require("./route/authRoute");

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use("/api/auth", authRoute);

connectDB();

app.get("/health", (req, res) => {
  res.status(200).json({ message: "The api is running" });
});

app.listen(process.env.PORT, () => {
  console.log("Server is listening to port: ", process.env.PORT);
});
