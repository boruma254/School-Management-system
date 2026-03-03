const express = require('express');
const authorizeRoles = require('../middleware/roleMiddleware');
const { requireStudentSelfByStudentIdParam } = require('../middleware/requireStudentSelf');
const {
  createStudent,
  listStudents,
  getStudent,
  getMyStudent,
  updateStudent,
  createStudentValidation,
  idParamValidation,
} = require('../controllers/studentController');

const router = express.Router();

router.get(
  '/',
  authorizeRoles('ADMIN', 'FINANCE', 'LECTURER'),
  listStudents
);

router.post(
  '/',
  authorizeRoles('ADMIN'),
  createStudentValidation,
  createStudent
);

router.get('/me', authorizeRoles('STUDENT'), getMyStudent);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'FINANCE', 'LECTURER', 'STUDENT'),
  idParamValidation,
  requireStudentSelfByStudentIdParam,
  getStudent
);

router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  idParamValidation,
  updateStudent
);

module.exports = router;

