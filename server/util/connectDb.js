const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully: ", conn.connection.host);
  } catch (error) {
    console.log("Error connecting to the database: ", error);
  }
};

module.exports = connectDB;
