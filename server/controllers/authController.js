const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const generateOtp = require('../utils/generateOtp');
const {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} = require('../utils/tokens');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthResponse = (user, accessToken, refreshToken) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  isEmailVerified: user.isEmailVerified,
  accessToken,
  refreshToken,
  token: accessToken,
});

const createUniqueGoogleUsername = async (name) => {
  const base = (name || 'googleuser')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 20) || 'googleuser';

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${base}${suffix}`;
    const exists = await User.exists({ username });
    if (!exists) return username;
  }

  return `${base}${Date.now().toString().slice(-8)}`;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      if (userExists.email === email && userExists.isEmailVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (userExists.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      // If email exists but not verified, we can overwrite or just resend OTP
      // For simplicity, let's delete the unverified user and recreate
      if (userExists.email === email && !userExists.isEmailVerified) {
        await User.findByIdAndDelete(userExists._id);
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phone: phone || undefined,
      isEmailVerified: false,
    });

    // Generate OTP
    const otpCode = generateOtp();
    await Otp.create({
      userId: user._id,
      email: user.email,
      otp: otpCode,
      purpose: 'verify_email',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send Email
    const emailSent = await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - ChatApp',
      text: `Your verification code is ${otpCode}. It expires in 5 minutes.`,
      html: `<h3>Welcome to ChatApp!</h3><p>Your verification code is <b>${otpCode}</b>.</p><p>It expires in 5 minutes.</p>`,
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending verification email' });
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      email: user.email,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email, otp, purpose: 'verify_email' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isEmailVerified = true;
    await user.save();
    
    // Delete OTP record
    await Otp.findByIdAndDelete(otpRecord._id);

    // Auto login after verify
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    console.log(`[auth] Email verified and session created for ${user.email}`);

    res.status(200).json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified && user.provider === 'local') {
      return res.status(403).json({ message: 'Please verify your email first', isVerified: false });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.isOnline = true;
    user.lastLogin = new Date();
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    console.log(`[auth] Password login succeeded for ${user.email}`);

    res.json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch(e) {
        return res.status(401).json({ message: 'Invalid Google Token' });
    }
    
    const { name, email, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for google
      const username = await createUniqueGoogleUsername(name);
      user = await User.create({
        username,
        email,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Dummy password
        avatar: picture,
        provider: 'google',
        googleId: sub,
        isEmailVerified: true,
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.isOnline = true;
    user.lastLogin = new Date();
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    console.log(`[auth] Google login succeeded for ${user.email}`);

    res.json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }
    
    const provider = user.provider || 'local';
    if (provider !== 'local') {
       return res.status(400).json({ message: 'This email is linked to a social login provider' });
    }

    const otpCode = generateOtp();
    await Otp.create({
      email,
      otp: otpCode,
      purpose: 'reset_password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail({
      email,
      subject: 'Reset Your Password - ChatApp',
      html: `<h3>Password Reset</h3><p>Your code is <b>${otpCode}</b>.</p><p>It expires in 5 minutes.</p>`,
    });

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password (Verify OTP & Change)
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await Otp.findOne({ email, otp, purpose: 'reset_password' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    user.password = newPassword; // Pre-save hook will hash it
    await user.save();

    await Otp.findByIdAndDelete(otpRecord._id);

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  try {
    if (req.user) {
        const user = await User.findById(req.user._id);
        if (user) {
            user.isOnline = false;
            user.refreshToken = '';
            await user.save();
        }
    }
    clearAuthCookies(res);
    console.log(`[auth] Logout completed for ${req.user?.email || 'unknown user'}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
const refresh = async (req, res) => {
  const tokenSource = req.cookies?.refreshToken ? 'cookie' : (req.headers['x-refresh-token'] ? 'x-refresh-token header' : (req.body?.refreshToken ? 'body' : 'none'));
  const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body?.refreshToken;

  console.log(`[auth/refresh] Request received. Token source: ${tokenSource}`);

  if (!refreshToken) {
    console.warn('[auth/refresh] 401 - Refresh token missing from request (cookie, header, body)');
    return res.status(401).json({ message: 'No refresh token provided', code: 'NO_REFRESH_TOKEN' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    console.log(`[auth/refresh] Refresh token JWT signature valid for user ID: ${decoded.id}`);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn(`[auth/refresh] 401 - User ID ${decoded.id} not found in database`);
      return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    if (user.refreshToken !== refreshToken) {
      console.warn(`[auth/refresh] 401 - Refresh token mismatch in database for ${user.email}`);
      return res.status(401).json({ message: 'Invalid refresh token', code: 'REFRESH_TOKEN_MISMATCH' });
    }

    const newAccessToken = generateAccessToken(user._id);
    setAuthCookies(res, newAccessToken, refreshToken);
    console.log(`[auth/refresh] 200 - Access token successfully refreshed for ${user.email}`);

    res.json({ message: 'Token refreshed', accessToken: newAccessToken, refreshToken });
  } catch (error) {
    console.warn(`[auth/refresh] 401 - Refresh token verification failed: ${error.message}`);
    res.status(401).json({ message: 'Invalid or expired refresh token', code: 'REFRESH_TOKEN_EXPIRED', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Switch Account (Testing Mode)
// @route   POST /api/auth/switch
const switchAccount = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    user.isOnline = true;
    user.lastLogin = new Date();
    await user.save();

    setAuthCookies(res, accessToken, newRefreshToken);

    res.json(buildAuthResponse(user, accessToken, newRefreshToken));
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired switch token' });
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  logout, 
  refresh,
  googleLogin,
  switchAccount
};
