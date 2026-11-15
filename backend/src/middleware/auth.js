const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../models/dataStore');

/**
 * Authentication Middleware:
 * Supports Bearer tokens (JWT) and falls back to demo user headers for effortless testing.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization Bearer token is missing or malformed.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify prototype JWT or Firebase token
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.users.get(decoded.id || decoded.uid);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User associated with this token does not exist.'
      });
    }

    req.user = {
      id: user.id,
      uid: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isHelper: user.isHelper
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'InvalidToken',
      message: 'Token has expired or is invalid.'
    });
  }
}

/**
 * Admin Role Guard:
 * Only allows users with role === 'admin' (Custom Claim)
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Administrator privileges are required to access this resource.'
    });
  }
  next();
}

/**
 * Optional Auth Middleware:
 * Attaches user if valid token present, otherwise proceeds unauthenticated.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = db.users.get(decoded.id || decoded.uid);
      if (user) {
        req.user = {
          id: user.id,
          uid: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isHelper: user.isHelper
        };
      }
    } catch (e) {
      // Ignore error for optional auth
    }
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
};
