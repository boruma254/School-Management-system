const adminService = require('../services/adminService');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

const approveStudentValidation = [body('admissionNumber').isString().notEmpty(), validateRequest];

async function listPendingStudentApprovals(req, res, next) {
  try {
    const pending = await adminService.listPendingStudentApprovals();
    res.json({ pending });
  } catch (err) {
    next(err);
  }
}

async function approveStudentByAdmissionNumber(req, res, next) {
  try {
    const approved = await adminService.approveStudentByAdmissionNumber(
      req.body.admissionNumber,
      req.user
    );
    res.json({ message: 'Student approved', student: approved });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  listPendingStudentApprovals,
  approveStudentByAdmissionNumber,
  approveStudentValidation,
};

