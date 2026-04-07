const { body, param } = require("express-validator");
const bcrypt = require("bcrypt");
const path = require("path");
const validateRequest = require("../middleware/validateRequest");
const studentService = require("../services/studentService");

const SALT_ROUNDS = 10;

const createStudentValidation = [
  body("fullName").isString().isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("admissionNumber").isString().notEmpty(),
  body("programId").isString().notEmpty(),
  body("currentSemester").isInt({ min: 1 }),
  body("status").isString().notEmpty(),
  validateRequest,
];

const idParamValidation = [param("id").isString().notEmpty(), validateRequest];

async function createStudent(req, res, next) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const student = await studentService.createStudent(
      { ...req.body, password: hashedPassword },
      req.user,
    );
    res.status(201).json({ message: "Student created", student });
  } catch (err) {
    next(err);
  }
}

async function listStudents(req, res, next) {
  try {
    const students = await studentService.listStudents();
    res.json({ students });
  } catch (err) {
    next(err);
  }
}

async function getStudent(req, res, next) {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json({ student });
  } catch (err) {
    next(err);
  }
}

async function getMyStudent(req, res, next) {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);
    res.json({ student });
  } catch (err) {
    next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    const student = await studentService.updateStudent(
      req.params.id,
      req.body,
      req.user,
    );
    res.json({ message: "Student updated", student });
  } catch (err) {
    next(err);
  }
}

const updateMyProfileValidation = [
  body("phoneNumber").optional().isString(),
  body("email").optional().isEmail(),
  body("password").optional().isString().isLength({ min: 8 }),
  validateRequest,
];

async function updateMyProfile(req, res, next) {
  try {
    const updated = await studentService.updateMyProfile(req.user.id, req.body);
    res.json({ message: "Profile updated", student: updated });
  } catch (err) {
    next(err);
  }
}

const MY_DOCUMENTS = [
  {
    id: "admission-letter",
    title: "Admission Letter",
    filename: "admission-letter.txt",
  },
  {
    id: "student-handbook",
    title: "Student Handbook",
    filename: "student-handbook.txt",
  },
  {
    id: "fee-payment-guide",
    title: "Fee Payment Guide",
    filename: "fee-payment-guide.txt",
  },
];

async function listMyDocuments(req, res, next) {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);

    // Only approved students can download documents.
    if (student.status !== "ACTIVE" || !student.user?.isActive) {
      const err = new Error("Student documents available after admin approval");
      err.statusCode = 403;
      throw err;
    }

    // Get lecturer documents
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const lecturerDocuments = await prisma.lecturerDocument.findMany({
      include: {
        lecturer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedLecturerDocs = lecturerDocuments.map((doc) => ({
      id: `lecturer-${doc.id}`,
      title: doc.title,
      description: doc.description,
      lecturer: doc.lecturer.user.fullName,
      createdAt: doc.createdAt,
      type: "lecturer-document",
    }));

    res.json({
      documents: [
        ...MY_DOCUMENTS.map(({ id, title }) => ({ id, title, type: "static" })),
        ...formattedLecturerDocs,
      ],
    });
  } catch (err) {
    next(err);
  }
}

async function downloadMyDocument(req, res, next) {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);

    if (student.status !== "ACTIVE" || !student.user?.isActive) {
      const err = new Error("Student documents available after admin approval");
      err.statusCode = 403;
      throw err;
    }

    const docId = req.params.docId;

    // Check if it's a lecturer document
    if (docId.startsWith("lecturer-")) {
      const lecturerDocId = docId.replace("lecturer-", "");
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const lecturerDoc = await prisma.lecturerDocument.findUnique({
        where: { id: lecturerDocId },
      });

      if (!lecturerDoc) {
        const err = new Error("Document not found");
        err.statusCode = 404;
        throw err;
      }

      res.download(
        lecturerDoc.filePath,
        lecturerDoc.title + path.extname(lecturerDoc.filePath),
      );
      return;
    }

    // Handle static documents
    const doc = MY_DOCUMENTS.find((d) => d.id === docId);
    if (!doc) {
      const err = new Error("Document not found");
      err.statusCode = 404;
      throw err;
    }

    const documentsDir = path.join(__dirname, "..", "..", "docs");
    const filePath = path.join(documentsDir, doc.filename);

    res.download(filePath, doc.filename);
  } catch (err) {
    next(err);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const result = await studentService.deleteStudent(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createStudent,
  listStudents,
  getStudent,
  getMyStudent,
  updateStudent,
  createStudentValidation,
  idParamValidation,
  listMyDocuments,
  downloadMyDocument,
  updateMyProfile,
  updateMyProfileValidation,
  deleteStudent,
};
