const { param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const notificationService = require("../services/notificationService");
const academicService = require("../services/academicService");

const notificationIdValidation = [
  param("id").isString().notEmpty(),
  validateRequest,
];

async function getMyNotifications(req, res, next) {
  try {
    const student = await academicService.getStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const notifications = await notificationService.getStudentNotifications(
      student.id,
    );
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    await notificationService.deleteNotification(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
  notificationIdValidation,
};
