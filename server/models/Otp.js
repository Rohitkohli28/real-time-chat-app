const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // User ID might be null if OTP is sent for signup before user is created
      // But we will create user and then send OTP, or send OTP by email.
    },
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['verify_email', 'reset_password', 'phone_login'],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically delete document when this date is reached
    },
  },
  {
    timestamps: true,
  }
);

// Helper to check if expired (though Mongo TTL will handle it mostly, good for quick checks)
otpSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt.getTime();
};

module.exports = mongoose.model('Otp', otpSchema);
