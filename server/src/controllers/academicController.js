const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const academicService = require("../services/academicService");
const notificationService = require("../services/notificationService");

const departmentValidation = [
  body("name").isString().notEmpty(),
  validateRequest,
];

const programValidation = [
  body("name").isString().notEmpty(),
  body("departmentId").isString().notEmpty(),
  validateRequest,
];

const unitValidation = [
  body("code").isString().notEmpty(),
  body("name").isString().notEmpty(),
  body("programId").isString().notEmpty(),
  body("semester").isInt({ min: 1 }),
  validateRequest,
];

const enrollmentValidation = [
  body("studentId").isString().notEmpty(),
  body("unitId").isString().notEmpty(),
  body("semester").isInt({ min: 1 }),
  validateRequest,
];

const unitIdValidation = [param("id").isString().notEmpty(), validateRequest];

const gradeValidation = [
  body("enrollmentId").isString().notEmpty(),
  body("catScore").isFloat({ min: 0 }),
  body("examScore").isFloat({ min: 0 }),
  validateRequest,
];

const lecturerDocumentValidation = [
  body("title").isString().notEmpty(),
  body("description").optional().isString(),
  validateRequest,
];

const chatRoomValidation = [
  body("name").isString().notEmpty(),
  body("unitId").optional().isString(),
  validateRequest,
];

const chatMessageValidation = [
  body("content").isString().notEmpty().isLength({ max: 1000 }),
  validateRequest,
];

const roomIdValidation = [
  param("roomId").isString().notEmpty(),
  validateRequest,
];

async function createDepartment(req, res, next) {
  try {
    const department = await academicService.createDepartment(req.body.name);
    res.status(201).json({ department });
  } catch (err) {
    next(err);
  }
}

async function listDepartments(req, res, next) {
  try {
    const departments = await academicService.listDepartments();
    res.json({ departments });
  } catch (err) {
    next(err);
  }
}

async function createProgram(req, res, next) {
  try {
    const program = await academicService.createProgram(req.body);
    res.status(201).json({ program });
  } catch (err) {
    next(err);
  }
}

async function listPrograms(req, res, next) {
  try {
    const programs = await academicService.listPrograms();
    res.json({ programs });
  } catch (err) {
    next(err);
  }
}

async function createUnit(req, res, next) {
  try {
    const unit = await academicService.createUnit(req.body);
    res.status(201).json({ unit });
  } catch (err) {
    next(err);
  }
}

async function listUnits(req, res, next) {
  try {
    const units = await academicService.listUnits();
    res.json({ units });
  } catch (err) {
    next(err);
  }
}

async function enrollStudent(req, res, next) {
  try {
    const enrollment = await academicService.enrollStudent(req.body);
    res.status(201).json({ enrollment });
  } catch (err) {
    next(err);
  }
}

async function recordGrade(req, res, next) {
  try {
    const grade = await academicService.recordGrade(req.body);
    res.status(201).json({ grade });
  } catch (err) {
    next(err);
  }
}

async function getUnitEnrollments(req, res, next) {
  try {
    const enrollments = await academicService.getUnitEnrollments(req.params.id);
    res.json({ enrollments });
  } catch (err) {
    next(err);
  }
}

async function getDepartmentOverview(req, res, next) {
  try {
    const overview = await academicService.getDepartmentOverview(req.params.id);
    res.json({ overview });
  } catch (err) {
    next(err);
  }
}

async function createLecturerDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const lecturer = await academicService.getLecturerByUserId(req.user.id);
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found" });
    }

    const document = await academicService.createLecturerDocument({
      title: req.body.title,
      description: req.body.description,
      filePath: req.file.path,
      lecturerId: lecturer.id,
    });
    res.status(201).json({ document });
  } catch (err) {
    next(err);
  }
}

async function listLecturerDocuments(req, res, next) {
  try {
    const documents = await academicService.listLecturerDocuments();
    res.json({ documents });
  } catch (err) {
    next(err);
  }
}

async function createChatRoom(req, res, next) {
  try {
    const lecturer = await academicService.getLecturerByUserId(req.user.id);
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found" });
    }

    const room = await academicService.createChatRoom(req.body);

    // Send notifications to all students
    await notificationService.createNotificationsForAllStudents({
      title: `New Chat Room: ${room.name}`,
      message: `A new chat room "${room.name}" has been created. Join the discussion!`,
      type: "chat_announcement",
      lecturerId: lecturer.id,
    });

    res.status(201).json({ room });
  } catch (err) {
    next(err);
  }
}

async function listChatRooms(req, res, next) {
  try {
    const rooms = await academicService.listChatRooms();
    res.json({ rooms });
  } catch (err) {
    next(err);
  }
}

async function createChatMessage(req, res, next) {
  try {
    const message = await academicService.createChatMessage({
      roomId: req.params.roomId,
      content: req.body.content,
      userId: req.user.id,
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

async function getChatMessages(req, res, next) {
  try {
    const messages = await academicService.getChatMessages(req.params.roomId);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

async function uploadChatRoomDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await academicService.uploadChatRoomDocument({
      roomId: req.params.roomId,
      userId: req.user.id,
      title: req.body.title,
      fileName: req.file.filename,
      filePath: req.file.path,
    });
    res.status(201).json({ document });
  } catch (err) {
    next(err);
  }
}

async function getChatRoomDocuments(req, res, next) {
  try {
    const documents = await academicService.getChatRoomDocuments(
      req.params.roomId,
    );
    res.json({ documents });
  } catch (err) {
    next(err);
  }
}

async function uploadAttendance(req, res, next) {
  try {
    const lecturer = await academicService.getLecturerByUserId(req.user.id);
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found" });
    }

    const attendanceData = req.body.attendanceData;
    if (!Array.isArray(attendanceData) || !attendanceData.length) {
      return res
        .status(400)
        .json({ message: "attendanceData must be a non-empty array." });
    }

    const invalidRows = attendanceData
      .map((record, index) => {
        if (!record || !record.studentId) {
          return `Row ${index + 1} is missing studentId.`;
        }
        if (!record.status) {
          return `Row ${index + 1} is missing status.`;
        }
        if (!record.date || Number.isNaN(new Date(record.date).getTime())) {
          return `Row ${index + 1} has invalid date.`;
        }
        return null;
      })
      .filter(Boolean);

    if (invalidRows.length) {
      return res.status(400).json({ message: invalidRows.join(" ") });
    }

    const attendance = await academicService.uploadAttendance({
      lecturerId: lecturer.id,
      attendanceData,
      sheetTitle: req.body.sheetTitle,
      fileName: req.body.fileName,
      filePath: req.body.filePath,
    });
    res.status(201).json({ attendance });
  } catch (err) {
    next(err);
  }
}

async function getAttendanceSheets(req, res, next) {
  try {
    const lecturer = await academicService.getLecturerByUserId(req.user.id);
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found" });
    }

    const sheets = await academicService.getAttendanceSheets(lecturer.id);
    const sheetSummaries = sheets.map((sheet) => ({
      id: sheet.id,
      title: sheet.title,
      createdAt: sheet.createdAt,
      studentCount: sheet.attendances.length,
    }));

    res.json({ sheets: sheetSummaries });
  } catch (err) {
    next(err);
  }
}

async function downloadAttendanceTemplate(req, res, next) {
  try {
    const students = await academicService.getAttendanceTemplateStudents();
    const header = ["studentId", "admissionNumber", "email", "status", "date"];
    const lines = [header.join(",")];

    for (const student of students) {
      lines.push(
        [
          student.id,
          student.admissionNumber || "",
          student.user?.email || "",
          "",
          "",
        ].join(","),
      );
    }

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_template.csv",
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function getMyAttendance(req, res, next) {
  try {
    const student = await academicService.getStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const attendance = await academicService.getStudentAttendance(student.id);
    res.json({ attendance });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDepartment,
  listDepartments,
  createProgram,
  listPrograms,
  createUnit,
  listUnits,
  enrollStudent,
  recordGrade,
  getUnitEnrollments,
  departmentValidation,
  programValidation,
  unitValidation,
  enrollmentValidation,
  unitIdValidation,
  gradeValidation,
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
  getAttendanceSheets,
  downloadAttendanceTemplate,
  getMyAttendance,
  lecturerDocumentValidation,
  chatRoomValidation,
  chatMessageValidation,
  roomIdValidation,
};
