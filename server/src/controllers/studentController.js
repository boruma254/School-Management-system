const { body, param } = require('express-validator');
const bcrypt = require('bcrypt');
const validateRequest = require('../middleware/validateRequest');
const studentService = require('../services/studentService');

const SALT_ROUNDS = 10;

const createStudentValidation = [
  body('fullName').isString().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('admissionNumber').isString().notEmpty(),
  body('programId').isString().notEmpty(),
  body('currentSemester').isInt({ min: 1 }),
  body('status').isString().notEmpty(),
  validateRequest,
];

const idParamValidation = [param('id').isString().notEmpty(), validateRequest];

async function createStudent(req, res, next) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const student = await studentService.createStudent(
      { ...req.body, password: hashedPassword },
      req.user
    );
    res.status(201).json({ message: 'Student created', student });
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
      req.user
    );
    res.json({ message: 'Student updated', student });
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
};

