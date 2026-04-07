const express = require("express");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
  notificationIdValidation,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authorizeRoles("STUDENT"), getMyNotifications);
router.put(
  "/:id/read",
  authorizeRoles("STUDENT"),
  notificationIdValidation,
  markNotificationAsRead,
);
router.delete(
  "/:id",
  authorizeRoles("STUDENT"),
  notificationIdValidation,
  deleteNotification,
);

module.exports = router;
