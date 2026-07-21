const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getJwtSecret = () => process.env.JWT_SECRET || 'chatapp_default_jwt_secret_key_2026';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || getJwtSecret();

const generateAccessToken = (id) => {
  return jwt.sign({ id, type: 'access' }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_TTL });
};

const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
  };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));
  }
};

const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
};

const verifyAccessToken = (token) => jwt.verify(token, getJwtSecret());

const verifyRefreshToken = (token) => jwt.verify(token, getRefreshSecret());

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyAccessToken,
  verifyRefreshToken,
};
