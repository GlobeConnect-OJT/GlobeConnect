const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const connectDb = require("./utils/connectDb");
const authRoute = require("./routes/authRoute");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

connectDb();

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
