const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Email service error:", error);
  } else {
    console.log("Email service ready:", success);
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>You have requested to reset your password for TVET ERP System.</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>Or copy this link: ${resetLink}</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        This is an automated email. Please do not reply to this message.
        <br>© ${new Date().getFullYear()} TVET ERP System - Kisii National Polytechnic
      </p>
    </div>
  `;

  return sendEmail(email, "Password Reset Request - TVET ERP", htmlContent);
};

const sendWelcomeEmail = async (email, userName, role) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to TVET ERP System</h2>
      <p>Hi ${userName},</p>
      <p>Your account has been successfully created as a <strong>${role}</strong>.</p>
      <p>You can now log in to the system using your email and password.</p>
      <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
        Go to TVET ERP
      </a>
      <p>If you have any questions, please contact the admin.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} TVET ERP System - Kisii National Polytechnic
      </p>
    </div>
  `;

  return sendEmail(email, "Welcome to TVET ERP System", htmlContent);
};

const sendNotificationEmail = async (email, userName, title, message) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${title}</h2>
      <p>Hi ${userName},</p>
      <p>${message}</p>
      <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        View in Portal
      </a>
      <hr>
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} TVET ERP System - Kisii National Polytechnic
      </p>
    </div>
  `;

  return sendEmail(email, `${title} - TVET ERP`, htmlContent);
};

const sendFeeReminderEmail = async (email, userName, amountDue, dueDate) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Fee Payment Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a reminder that you have an outstanding fee balance.</p>
      <p style="font-size: 18px; font-weight: bold;">Amount Due: KES ${amountDue.toLocaleString()}</p>
      <p>Due Date: ${new Date(dueDate).toLocaleDateString()}</p>
      <a href="${process.env.FRONTEND_URL}/payments" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
        Make Payment
      </a>
      <p>Please make the payment to avoid any penalties.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} TVET ERP System - Kisii National Polytechnic
      </p>
    </div>
  `;

  return sendEmail(email, "Fee Payment Reminder - TVET ERP", htmlContent);
};

const sendAssignmentDeadlineEmail = async (
  email,
  userName,
  assignmentTitle,
  deadline,
) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Assignment Deadline Alert</h2>
      <p>Hi ${userName},</p>
      <p>You have an upcoming assignment deadline:</p>
      <p style="font-size: 16px; font-weight: bold;">${assignmentTitle}</p>
      <p>Deadline: ${new Date(deadline).toLocaleString()}</p>
      <a href="${process.env.FRONTEND_URL}/assignments" style="display: inline-block; padding: 10px 20px; background-color: #ffc107; color: black; text-decoration: none; border-radius: 5px;">
        View Assignment
      </a>
      <p>Make sure to submit your work before the deadline.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} TVET ERP System - Kisii National Polytechnic
      </p>
    </div>
  `;

  return sendEmail(
    email,
    `Assignment Deadline: ${assignmentTitle}`,
    htmlContent,
  );
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
  sendFeeReminderEmail,
  sendAssignmentDeadlineEmail,
  transporter,
};
