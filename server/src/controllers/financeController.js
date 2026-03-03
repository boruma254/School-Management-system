const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const financeService = require('../services/financeService');

const feeStructureValidation = [
  body('programId').isString().notEmpty(),
  body('semester').isInt({ min: 1 }),
  body('amount').isFloat({ min: 0 }),
  validateRequest,
];

const mpesaInitValidation = [
  body('studentId').isString().notEmpty(),
  body('amount').isFloat({ min: 1 }),
  body('phoneNumber').isString().notEmpty(),
  validateRequest,
];

const studentIdParamValidation = [
  param('studentId').isString().notEmpty(),
  validateRequest,
];

const receiptParamValidation = [
  param('paymentId').isString().notEmpty(),
  validateRequest,
];

async function createFeeStructure(req, res, next) {
  try {
    const feeStructure = await financeService.createFeeStructure(req.body);
    res.status(201).json({ feeStructure });
  } catch (err) {
    next(err);
  }
}

async function listFeeStructures(req, res, next) {
  try {
    const feeStructures = await financeService.listFeeStructures();
    res.json({ feeStructures });
  } catch (err) {
    next(err);
  }
}

async function initiateMpesa(req, res, next) {
  try {
    const result = await financeService.initiateMpesaPayment(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function mpesaCallback(req, res, next) {
  try {
    await financeService.handleMpesaCallback(req.body);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    next(err);
  }
}

async function listStudentPayments(req, res, next) {
  try {
    const payments = await financeService.listPaymentsByStudent(
      req.params.studentId,
      req.user
    );
    res.json({ payments });
  } catch (err) {
    next(err);
  }
}

async function getReceipt(req, res, next) {
  try {
    const payment = await financeService.getReceipt(req.params.paymentId, req.user);
    res.json({ receipt: payment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFeeStructure,
  listFeeStructures,
  initiateMpesa,
  mpesaCallback,
  listStudentPayments,
  getReceipt,
  feeStructureValidation,
  mpesaInitValidation,
  studentIdParamValidation,
  receiptParamValidation,
};

