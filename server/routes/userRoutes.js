const express = require('express');
const router = express.Router();
const { getAllUsers, getUserProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
