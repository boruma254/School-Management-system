const { body } = require('express-validator');
const authService = require('../services/authService');
const validateRequest = require('../middleware/validateRequest');

const registerValidation = [
  body('fullName').isString().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['ADMIN', 'LECTURER', 'STUDENT', 'FINANCE']),
  validateRequest,
];

const loginValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: 1 }),
  validateRequest,
];

const refreshValidation = [body('refreshToken').isString(), validateRequest];

const studentSignupValidation = [
  body('fullName').isString().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('admissionNumber').isString().notEmpty(),
  body('currentSemester').optional().isInt({ min: 1 }),
  validateRequest,
];

async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.body, req.user);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body.email,
      req.body.password
    );
    res.json({
      message: 'Login successful',
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function studentSignup(req, res, next) {
  try {
    const result = await authService.requestStudentSignup(req.body);
    // Student will be redirected to login; actual access is granted only after admin approval.
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  registerValidation,
  loginValidation,
  refreshValidation,
  studentSignup,
  studentSignupValidation,
};

