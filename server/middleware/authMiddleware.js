const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;
    req.token = token;

    next();
  } catch (error) {
    console.log("Error: ", error);
    res.status(400).json({ message: error });
  }
};

module.exports = authMiddleware;
