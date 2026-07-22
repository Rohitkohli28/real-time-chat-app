const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe, 
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    refresh,
    googleLogin,
    guestLogin,
    switchAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.post('/switch', switchAccount);
router.get('/me', protect, getMe);

module.exports = router;
