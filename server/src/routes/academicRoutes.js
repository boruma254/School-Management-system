const express = require('express');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
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
} = require('../controllers/academicController');

const router = express.Router();

router.get(
  '/departments',
  authorizeRoles('ADMIN', 'LECTURER'),
  listDepartments
);
router.post(
  '/departments',
  authorizeRoles('ADMIN'),
  departmentValidation,
  createDepartment
);

router.get('/programs', authorizeRoles('ADMIN', 'LECTURER'), listPrograms);
router.post(
  '/programs',
  authorizeRoles('ADMIN'),
  programValidation,
  createProgram
);

router.get('/units', authorizeRoles('ADMIN', 'LECTURER'), listUnits);
router.post(
  '/units',
  authorizeRoles('ADMIN'),
  unitValidation,
  createUnit
);

router.post(
  '/enrollments',
  authorizeRoles('ADMIN', 'LECTURER'),
  enrollmentValidation,
  enrollStudent
);

router.post(
  '/grades',
  authorizeRoles('ADMIN', 'LECTURER'),
  gradeValidation,
  recordGrade
);

module.exports = router;

