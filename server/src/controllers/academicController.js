const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const academicService = require('../services/academicService');

const departmentValidation = [
  body('name').isString().notEmpty(),
  validateRequest,
];

const programValidation = [
  body('name').isString().notEmpty(),
  body('departmentId').isString().notEmpty(),
  validateRequest,
];

const unitValidation = [
  body('code').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('programId').isString().notEmpty(),
  body('semester').isInt({ min: 1 }),
  validateRequest,
];

const enrollmentValidation = [
  body('studentId').isString().notEmpty(),
  body('unitId').isString().notEmpty(),
  body('semester').isInt({ min: 1 }),
  validateRequest,
];

const gradeValidation = [
  body('enrollmentId').isString().notEmpty(),
  body('catScore').isFloat({ min: 0 }),
  body('examScore').isFloat({ min: 0 }),
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

async function getDepartmentOverview(req, res, next) {
  try {
    const overview = await academicService.getDepartmentOverview(req.params.id);
    res.json({ overview });
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
  departmentValidation,
  programValidation,
  unitValidation,
  enrollmentValidation,
  gradeValidation,
  getDepartmentOverview,
};

