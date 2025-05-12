const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;