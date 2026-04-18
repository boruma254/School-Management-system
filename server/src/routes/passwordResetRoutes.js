const express = require("express");
const { body } = require("express-validator");
const {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} = require("../controllers/passwordResetController");

const router = express.Router();

// Request password reset
router.post(
  "/request",
  [body("email").isEmail().normalizeEmail()],
  requestPasswordReset,
);

// Verify reset token
router.get("/verify", verifyResetToken);

// Reset password
router.post(
  "/reset",
  [
    body("token").notEmpty().trim(),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  resetPassword,
);

module.exports = router;
