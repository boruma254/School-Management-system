const express = require("express");
const authRoutes = require("./authRoutes");
const studentRoutes = require("./studentRoutes");
const academicRoutes = require("./academicRoutes");
const financeRoutes = require("./financeRoutes");
const adminRoutes = require("./adminRoutes");
const notificationRoutes = require("./notificationRoutes");
const passwordResetRoutes = require("./passwordResetRoutes");
const scheduleRoutes = require("./scheduleRoutes");
const prerequisiteRoutes = require("./prerequisiteRoutes");
const leaveRequestRoutes = require("./leaveRequestRoutes");
const authMiddleware = require("../middleware/authMiddleware");
const { mpesaCallback } = require("../controllers/financeController");

const router = express.Router();

router.use("/auth", authRoutes);

// Password reset routes (no auth required)
router.use("/password-reset", passwordResetRoutes);

// M-Pesa callback must be publicly accessible (no JWT)
router.post("/finance/mpesa/callback", mpesaCallback);

// All routes below this require authentication
router.use(authMiddleware);

router.use("/students", studentRoutes);
router.use("/academic", academicRoutes);
router.use("/finance", financeRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/prerequisites", prerequisiteRoutes);
router.use("/leave-requests", leaveRequestRoutes);

module.exports = router;
