const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { protect } = require("../middleware/authMiddleware");
const { checkAdminRole } = require("../middleware/adminMiddleware");
const APIFeatures = require("../utils/apiFeatures");

// Admin controller functions
const adminController = {
  // @desc    Get all posts with admin privileges (additional filtering options)
  // @route   GET /api/admin/posts
  // @access  Private (Admin only)
  getAllPosts: async (req, res, next) => {
    try {
      // Create a query object with filtering, sorting, and pagination
      const features = new APIFeatures(Post.find(), req.query)
        .filter()
        .search()
        .sort()
        .limitFields()
        .paginate();

      // Add population for author details
      const query = features.query.populate([
        {
          path: "author",
          select: "username email",
        },
        {
          path: "comments.user",
          select: "username",
        },
      ]);

      // Execute the query
      const posts = await query;

      // Get total count for pagination
      const totalPosts = await Post.countDocuments();

      // Send response
      res.status(200).json({
        status: "success",
        results: posts.length,
        total: totalPosts,
        data: {
          posts,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // @desc    Delete any post (admin privilege)
  // @route   DELETE /api/admin/posts/:id
  // @access  Private (Admin only)
  deletePost: async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          status: "fail",
          message: "No post found with that ID",
        });
      }

      // Delete images from Cloudinary
      if (post.images && post.images.length > 0) {
        const cloudinary = require("../utils/cloudinary");
        for (const imageUrl of post.images) {
          const publicId = cloudinary.getPublicIdFromUrl(imageUrl);
          await cloudinary.deleteImage(publicId);
        }
      }

      // Delete the post
      await Post.findByIdAndDelete(req.params.id);

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  // @desc    Delete any comment (admin privilege)
  // @route   DELETE /api/admin/comments/:commentId
  // @access  Private (Admin only)
  deleteComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;

      // Find post that contains the comment
      const post = await Post.findOne({ "comments._id": commentId });

      if (!post) {
        return res.status(404).json({
          status: "fail",
          message: "No comment found with that ID",
        });
      }

      // Remove the comment
      post.comments = post.comments.filter(
        (comment) => comment._id.toString() !== commentId
      );

      await post.save();

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  // @desc    Get system statistics
  // @route   GET /api/admin/statistics
  // @access  Private (Admin only)
  getStatistics: async (req, res, next) => {
    try {
      const User = require("../models/User");

      const userCount = await User.countDocuments();
      const postCount = await Post.countDocuments();

      const totalComments = await Post.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: { $size: "$comments" } },
          },
        },
      ]);

      const commentCount =
        totalComments.length > 0 ? totalComments[0].count : 0;

      const totalLikes = await Post.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: { $size: "$likes" } },
          },
        },
      ]);

      const likeCount = totalLikes.length > 0 ? totalLikes[0].count : 0;

      res.status(200).json({
        status: "success",
        data: {
          statistics: {
            userCount,
            postCount,
            commentCount,
            likeCount,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// Admin routes
router.get("/posts", protect, checkAdminRole, adminController.getAllPosts);
router.delete(
  "/posts/:id",
  protect,
  checkAdminRole,
  adminController.deletePost
);
router.delete(
  "/comments/:commentId",
  protect,
  checkAdminRole,
  adminController.deleteComment
);
router.get(
  "/statistics",
  protect,
  checkAdminRole,
  adminController.getStatistics
);

module.exports = router;
