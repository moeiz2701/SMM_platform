// controllers/userController.js
const User = require('../models/User'); // Assuming you have a User model
const ErrorResponse = require('../utils/errorResponse'); // For error handling

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email'); // Only return name and email
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (err) {
    next(err);
  }
};

// controllers/userController.js
exports.getUsersBatch = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return next(new ErrorResponse('Please provide an array of user IDs', 400));
    }

    const users = await User.find({ 
      _id: { $in: userIds } 
    }).select('name');

    res.status(200).json({
      success: true,
      data: users
    });
    
  } catch (err) {
    next(err);
  }
};