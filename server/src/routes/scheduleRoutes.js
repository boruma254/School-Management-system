const express = require("express");
const { body, param } = require("express-validator");
const { authMiddleware } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  createSchedule,
  getUnitSchedule,
  getStudentTimetable,
  getLecturerTimetable,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

const router = express.Router();

// Create schedule (admin/lecturer only)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "LECTURER"),
  [
    body("unitId").notEmpty().trim(),
    body("dayOfWeek").notEmpty().trim(),
    body("startTime").notEmpty().trim(),
    body("endTime").notEmpty().trim(),
  ],
  createSchedule,
);

// Get schedule for a unit
router.get(
  "/unit/:unitId",
  [param("unitId").notEmpty().trim()],
  getUnitSchedule,
);

// Get student timetable
router.get(
  "/student/timetable",
  authMiddleware,
  authorizeRoles("STUDENT"),
  getStudentTimetable,
);

// Get lecturer timetable
router.get(
  "/lecturer/timetable",
  authMiddleware,
  authorizeRoles("LECTURER"),
  getLecturerTimetable,
);

// Update schedule
router.put(
  "/:scheduleId",
  authMiddleware,
  authorizeRoles("ADMIN", "LECTURER"),
  [param("scheduleId").notEmpty().trim()],
  updateSchedule,
);

// Delete schedule
router.delete(
  "/:scheduleId",
  authMiddleware,
  authorizeRoles("ADMIN", "LECTURER"),
  [param("scheduleId").notEmpty().trim()],
  deleteSchedule,
);

module.exports = router;
