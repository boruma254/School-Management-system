const express = require("express");
const { body, param } = require("express-validator");
const { authMiddleware } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  addPrerequisite,
  getUnitPrerequisites,
  checkPrerequisites,
  removePrerequisite,
} = require("../controllers/prerequisiteController");

const router = express.Router();

// Add prerequisite (admin only)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  [
    body("unitId").notEmpty().trim(),
    body("prerequisiteUnitId").notEmpty().trim(),
  ],
  addPrerequisite,
);

// Get prerequisites for a unit
router.get(
  "/unit/:unitId",
  [param("unitId").notEmpty().trim()],
  getUnitPrerequisites,
);

// Check if student meets prerequisites
router.get(
  "/:unitId/check",
  authMiddleware,
  authorizeRoles("STUDENT"),
  [param("unitId").notEmpty().trim()],
  checkPrerequisites,
);

// Remove prerequisite (admin only)
router.delete(
  "/:prerequisiteId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  [param("prerequisiteId").notEmpty().trim()],
  removePrerequisite,
);

module.exports = router;
