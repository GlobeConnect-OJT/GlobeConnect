const User = require("../models/User");

// @desc    Add location to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { latitude, longitude, city, state, country, displayName } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        status: "fail",
        message: "Latitude and longitude are required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if location is already in favorites
    const existingFavorite = user.favorites.find(
      (fav) =>
        Math.abs(fav.latitude - latitude) < 0.0001 &&
        Math.abs(fav.longitude - longitude) < 0.0001
    );

    if (existingFavorite) {
      return res.status(400).json({
        status: "fail",
        message: "Location is already in favorites",
      });
    }

    // Add to favorites
    user.favorites.push({
      latitude,
      longitude,
      city,
      state,
      country,
      displayName,
    });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Location added to favorites",
      data: {
        favorite: user.favorites[user.favorites.length - 1],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove location from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const favoriteId = req.params.id;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Find and remove the favorite
    const favoriteIndex = user.favorites.findIndex(
      (fav) => fav._id.toString() === favoriteId
    );

    if (favoriteIndex === -1) {
      return res.status(404).json({
        status: "fail",
        message: "Favorite not found",
      });
    }

    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Location removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      results: user.favorites.length,
      data: {
        favorites: user.favorites,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if location is in favorites
// @route   GET /api/favorites/check/:lat/:lng
// @access  Private
exports.checkFavorite = async (req, res, next) => {
  try {
    const { lat, lng } = req.params;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid coordinates",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if location is in favorites (with small tolerance for floating point comparison)
    const favorite = user.favorites.find(
      (fav) =>
        Math.abs(fav.latitude - latitude) < 0.0001 &&
        Math.abs(fav.longitude - longitude) < 0.0001
    );

    res.status(200).json({
      status: "success",
      data: {
        isFavorite: !!favorite,
        favorite: favorite || null,
      },
    });
  } catch (error) {
    next(error);
  }
}; 