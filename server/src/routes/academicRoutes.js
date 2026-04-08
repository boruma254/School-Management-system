const express = require("express");
const path = require("path");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createDepartment,
  listDepartments,
  createProgram,
  listPrograms,
  createUnit,
  listUnits,
  enrollStudent,
  recordGrade,
  getUnitEnrollments,
  getDepartmentOverview,
  createLecturerDocument,
  listLecturerDocuments,
  createChatRoom,
  listChatRooms,
  createChatMessage,
  getChatMessages,
  uploadChatRoomDocument,
  getChatRoomDocuments,
  uploadAttendance,
  getMyAttendance,
  departmentValidation,
  programValidation,
  unitValidation,
  enrollmentValidation,
  unitIdValidation,
  gradeValidation,
  lecturerDocumentValidation,
  chatRoomValidation,
  chatMessageValidation,
  roomIdValidation,
} = require("../controllers/academicController");

const router = express.Router();

router.get(
  "/departments",
  authorizeRoles("ADMIN", "LECTURER"),
  listDepartments,
);
router.get(
  "/departments/:id/overview",
  authorizeRoles("ADMIN", "LECTURER"),
  getDepartmentOverview,
);
router.post(
  "/departments",
  authorizeRoles("ADMIN"),
  departmentValidation,
  createDepartment,
);

router.get("/programs", authorizeRoles("ADMIN", "LECTURER"), listPrograms);
router.post(
  "/programs",
  authorizeRoles("ADMIN"),
  programValidation,
  createProgram,
);

router.get("/units", authorizeRoles("ADMIN", "LECTURER"), listUnits);
router.get(
  "/units/:id/enrollments",
  authorizeRoles("ADMIN", "LECTURER"),
  unitIdValidation,
  getUnitEnrollments,
);
router.post("/units", authorizeRoles("ADMIN"), unitValidation, createUnit);

router.post(
  "/enrollments",
  authorizeRoles("ADMIN", "LECTURER"),
  enrollmentValidation,
  enrollStudent,
);

router.post(
  "/grades",
  authorizeRoles("ADMIN", "LECTURER"),
  gradeValidation,
  recordGrade,
);

router.post(
  "/documents",
  authorizeRoles("LECTURER"),
  upload.single("document"),
  lecturerDocumentValidation,
  createLecturerDocument,
);
router.get("/documents", authorizeRoles("STUDENT"), listLecturerDocuments);
router.get("/documents/:id/download", authorizeRoles("STUDENT"), (req, res) => {
  // For now, just serve the file directly
  // In production, you might want to add more security checks
  const filePath = path.join(__dirname, "..", "..", "uploads", req.params.id);
  res.download(filePath);
});

router.post(
  "/chat/rooms",
  authorizeRoles("LECTURER"),
  chatRoomValidation,
  createChatRoom,
);
router.get("/chat/rooms", authorizeRoles("STUDENT", "LECTURER"), listChatRooms);
router.post(
  "/chat/rooms/:roomId/messages",
  authorizeRoles("STUDENT", "LECTURER"),
  roomIdValidation,
  chatMessageValidation,
  createChatMessage,
);
router.get(
  "/chat/rooms/:roomId/messages",
  authorizeRoles("STUDENT", "LECTURER"),
  roomIdValidation,
  getChatMessages,
);

// Chat room documents
router.post(
  "/chat/rooms/:roomId/documents",
  authorizeRoles("LECTURER"),
  upload.single("document"),
  uploadChatRoomDocument,
);
router.get(
  "/chat/rooms/:roomId/documents",
  authorizeRoles("STUDENT", "LECTURER"),
  getChatRoomDocuments,
);

// Attendance
router.get(
  "/attendance/template",
  authorizeRoles("LECTURER"),
  downloadAttendanceTemplate,
);
router.post("/attendance/upload", authorizeRoles("LECTURER"), uploadAttendance);
router.get("/attendance/my", authorizeRoles("STUDENT"), getMyAttendance);

module.exports = router;
