const Post = require("../models/Post");

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No post found with that ID",
      });
    }

    // Check if the user has already liked the post
    const userIndex = post.likes.findIndex(
      (userId) => userId.toString() === req.user.id
    );

    // If user already liked, remove the like; otherwise add it
    if (userIndex > -1) {
      // User already liked, so remove the like
      post.likes.splice(userIndex, 1);
      await post.save();

      return res.status(200).json({
        status: "success",
        message: "Post unliked",
        data: {
          liked: false,
          likesCount: post.likes.length,
        },
      });
    } else {
      // User has not liked, so add the like
      post.likes.push(req.user._id);
      await post.save();

      return res.status(200).json({
        status: "success",
        message: "Post liked",
        data: {
          liked: true,
          likesCount: post.likes.length,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get users who liked a post
// @route   GET /api/posts/:id/likes
// @access  Public
exports.getLikes = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: "likes",
      select: "username",
    });

    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No post found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      results: post.likes.length,
      data: {
        likes: post.likes,
      },
    });
  } catch (error) {
    next(error);
  }
};
