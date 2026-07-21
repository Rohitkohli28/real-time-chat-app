const User = require('../models/User');
const { generateAccessToken, setAuthCookies, verifyAccessToken, verifyRefreshToken } = require('../utils/tokens');

const loadUser = async (id) => {
  return User.findById(id).select('-password');
};

const protect = async (req, res, next) => {
  let token;
  let tokenSource = 'none';

  // Check cookies first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
    tokenSource = 'cookie';
  } 
  // Fallback to Bearer token header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    tokenSource = 'authorization_header';
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await loadUser(decoded.id);

      if (!user) {
        console.warn(`[auth-middleware] 401 for ${req.method} ${req.originalUrl} - Reason: User ID ${decoded.id} from token not found in DB`);
        return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      }

      req.user = user;
      console.log(`[auth-middleware] 200 Authorized ${user.email} on ${req.method} ${req.originalUrl} via ${tokenSource}`);
      return next();
    } catch (accessErr) {
      console.warn(`[auth-middleware] Access token check failed on ${req.method} ${req.originalUrl} (source: ${tokenSource}): ${accessErr.message}`);
    }
  } else {
    console.warn(`[auth-middleware] No access token provided on ${req.method} ${req.originalUrl}`);
  }

  // Attempt refresh token fallback if access token was missing or invalid
  const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body?.refreshToken;
  const refreshSource = req.cookies?.refreshToken ? 'cookie' : (req.headers['x-refresh-token'] ? 'x-refresh-token header' : (req.body?.refreshToken ? 'body' : 'none'));

  if (!refreshToken) {
    console.warn(`[auth-middleware] 401 Unauthorized on ${req.method} ${req.originalUrl} - Reason: No valid access token and no refresh token provided (tokenSource=${tokenSource}, refreshSource=${refreshSource})`);
    return res.status(401).json({
      message: token ? 'Access token invalid or expired' : 'Not authorized, no token',
      code: token ? 'ACCESS_TOKEN_INVALID' : 'NO_TOKEN',
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await loadUser(decoded.id);

    if (!user) {
      console.warn(`[auth-middleware] 401 Unauthorized on ${req.method} ${req.originalUrl} - Reason: Refresh token user ${decoded.id} not found in DB`);
      return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    if (user.refreshToken !== refreshToken) {
      console.warn(`[auth-middleware] 401 Unauthorized on ${req.method} ${req.originalUrl} - Reason: Refresh token mismatch for user ${user.email}`);
      return res.status(401).json({ message: 'Refresh token invalid', code: 'REFRESH_TOKEN_INVALID' });
    }

    const newAccessToken = generateAccessToken(user._id);
    setAuthCookies(res, newAccessToken, refreshToken);
    req.user = user;
    res.setHeader('X-Access-Token-Refreshed', 'true');
    console.log(`[auth-middleware] 200 Auto-refreshed access token for ${user.email} on ${req.method} ${req.originalUrl} via ${refreshSource}`);
    return next();
  } catch (refreshError) {
    console.warn(`[auth-middleware] 401 Unauthorized on ${req.method} ${req.originalUrl} - Reason: Refresh token verification failed: ${refreshError.message}`);
    return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED', error: refreshError.message });
  }
};

module.exports = { protect };
