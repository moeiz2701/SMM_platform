const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes - user must be logged in
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user owns the resource or is admin
exports.checkOwnership = (model) => {
  return async (req, res, next) => {
    // Skip ownership check for admins
    if (req.user.role === 'admin') {
      return next();
    }

    let resource;
    try {
      resource = await model.findById(req.params.id);
    } catch (error) {
      return next(new ErrorResponse('Resource not found', 404));
    }

    // Check if resource exists and belongs to user
    if (!resource || resource.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse('Not authorized to access this resource', 403)
      );
    }

    next();
  };
};