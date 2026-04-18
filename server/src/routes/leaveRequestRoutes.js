const express = require("express");
const { body, param } = require("express-validator");
const { authMiddleware } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  submitLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
} = require("../controllers/leaveRequestController");

const router = express.Router();

// Submit leave request (student only)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("STUDENT"),
  [
    body("reason").notEmpty().trim().isLength({ min: 10 }),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
  ],
  submitLeaveRequest,
);

// Get my leave requests (student)
router.get(
  "/my/requests",
  authMiddleware,
  authorizeRoles("STUDENT"),
  getMyLeaveRequests,
);

// Get all leave requests (admin/lecturer)
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "LECTURER"),
  getAllLeaveRequests,
);

// Approve leave request (admin only)
router.put(
  "/:leaveRequestId/approve",
  authMiddleware,
  authorizeRoles("ADMIN"),
  [param("leaveRequestId").notEmpty().trim()],
  approveLeaveRequest,
);

// Reject leave request (admin only)
router.put(
  "/:leaveRequestId/reject",
  authMiddleware,
  authorizeRoles("ADMIN"),
  [
    param("leaveRequestId").notEmpty().trim(),
    body("rejectionReason").notEmpty().trim().isLength({ min: 10 }),
  ],
  rejectLeaveRequest,
);

// Cancel leave request (student only)
router.delete(
  "/:leaveRequestId",
  authMiddleware,
  authorizeRoles("STUDENT"),
  [param("leaveRequestId").notEmpty().trim()],
  cancelLeaveRequest,
);

module.exports = router;
