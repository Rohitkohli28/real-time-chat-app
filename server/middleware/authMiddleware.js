const User = require('../models/User');
const { generateAccessToken, setAuthCookies, verifyAccessToken, verifyRefreshToken } = require('../utils/tokens');

const loadUser = async (id) => {
  return User.findById(id).select('-password');
};

const protect = async (req, res, next) => {
  let token;

  // Check cookies first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } 
  // Fallback to Bearer token
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  try {
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = await loadUser(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      }

      return next();
    }

    throw new Error('missing_access_token');
  } catch (error) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: token ? 'Access token invalid or expired' : 'Not authorized, no token',
        code: token ? 'ACCESS_TOKEN_INVALID' : 'NO_TOKEN',
      });
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await loadUser(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: 'Refresh token invalid', code: 'REFRESH_TOKEN_INVALID' });
      }

      const newAccessToken = generateAccessToken(user._id);
      setAuthCookies(res, newAccessToken, refreshToken);
      req.user = user;
      res.setHeader('X-Access-Token-Refreshed', 'true');
      console.log(`[auth] Refreshed expired access token for ${user.email}`);
      return next();
    } catch (refreshError) {
      return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED' });
    }
  }
};

module.exports = { protect };
