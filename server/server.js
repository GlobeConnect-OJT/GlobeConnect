const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const historyRoutes = require("./routes/historyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Import error handler middleware
const errorHandler = require("./middleware/errorHandler");

// Import database connection
const connectDB = require("./config/db");

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Connect to database
connectDB();

// Initialize Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to our routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join user to their personal room for notifications
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their notification room`);
    }
  });

  // Join a room for specific post
  socket.on("join-post", (postId) => {
    socket.join(`post:${postId}`);
    console.log(`Socket ${socket.id} joined room for post: ${postId}`);
  });

  // Leave a post room
  socket.on("leave-post", (postId) => {
    socket.leave(`post:${postId}`);
    console.log(`Socket ${socket.id} left room for post: ${postId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(limiter);

// Set static folder
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/notifications", notificationRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Global States Explorer API" });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`,
  );
  console.log(`Socket.IO initialized`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
