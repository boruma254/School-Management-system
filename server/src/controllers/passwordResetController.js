const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { sendPasswordResetEmail } = require("../services/emailService");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

// Request password reset - send email with reset link
const requestPasswordReset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Invalidate old reset tokens
    await prisma.passwordResetToken.updateMany(
      {
        userId: user.id,
        used: false,
      },
      {
        used: true,
      },
    );

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token in database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Send email with reset link
    try {
      await sendPasswordResetEmail(email, resetToken, user.fullName);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request, just log the error
    }

    res.status(200).json({
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Error processing request" });
  }
};

// Reset password - verify token and update password
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find reset token
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { userId: true },
    });

    if (!resetTokenRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token is expired
    if (resetTokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Check if token has been used
    if (resetTokenRecord.used) {
      return res
        .status(400)
        .json({ error: "Reset token has already been used" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { used: true },
    });

    res.status(200).json({
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password" });
  }
};

// Verify reset token validity
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find reset token
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetTokenRecord) {
      return res.status(400).json({ valid: false, error: "Invalid token" });
    }

    // Check if token is expired
    if (resetTokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, error: "Token has expired" });
    }

    // Check if token has been used
    if (resetTokenRecord.used) {
      return res
        .status(400)
        .json({ valid: false, error: "Token has already been used" });
    }

    res.status(200).json({ valid: true, message: "Token is valid" });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ valid: false, error: "Error verifying token" });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
};
