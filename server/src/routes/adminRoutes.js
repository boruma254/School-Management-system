const express = require('express');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  getDashboard,
  getFinanceDashboard,
  listPendingStudentApprovals,
  approveStudentByAdmissionNumber,
  approveStudentValidation,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', authorizeRoles('ADMIN', 'FINANCE'), getDashboard);
router.get(
  '/finance/summary',
  authorizeRoles('ADMIN', 'FINANCE'),
  getFinanceDashboard
);

router.get('/students/pending', authorizeRoles('ADMIN'), listPendingStudentApprovals);

router.post(
  '/students/approve',
  authorizeRoles('ADMIN'),
  approveStudentValidation,
  approveStudentByAdmissionNumber
);

module.exports = router;

