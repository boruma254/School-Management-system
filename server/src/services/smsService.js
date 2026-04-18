const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Twilio client (can be replaced with Africa's Talking SDK)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const sendSMS = async (phoneNumber, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.warn("SMS service not configured - skipping");
      return { success: false, message: "SMS service not configured" };
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log("SMS sent:", result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

const sendFeeReminderSMS = async (phoneNumber, amountDue) => {
  const message = `TVET ERP: You have an outstanding fee balance of KES ${amountDue}. Please make payment to avoid penalties. Visit ${process.env.FRONTEND_URL}/payments`;
  return sendSMS(phoneNumber, message);
};

const sendAssignmentDeadlineSMS = async (phoneNumber, assignmentTitle) => {
  const message = `TVET ERP: Assignment deadline alert for "${assignmentTitle}". Visit the portal to submit.`;
  return sendSMS(phoneNumber, message);
};

const sendAttendanceAlertSMS = async (phoneNumber, attendancePercentage) => {
  const message = `TVET ERP: Your attendance is at ${attendancePercentage}%. Low attendance may affect your grades.`;
  return sendSMS(phoneNumber, message);
};

const sendPaymentConfirmationSMS = async (phoneNumber, amount, reference) => {
  const message = `TVET ERP: Payment of KES ${amount} confirmed. Reference: ${reference}. Thank you!`;
  return sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendFeeReminderSMS,
  sendAssignmentDeadlineSMS,
  sendAttendanceAlertSMS,
  sendPaymentConfirmationSMS,
};
