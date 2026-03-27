const express = require('express');
const {
  register,
  login,
  refresh,
  registerValidation,
  loginValidation,
  refreshValidation,
  studentSignup,
  studentSignupValidation,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/refresh', refreshValidation, refresh);

router.post(
  '/student-signup',
  studentSignupValidation,
  studentSignup
);

router.post(
  '/register',
  authMiddleware,
  authorizeRoles('ADMIN'),
  registerValidation,
  register
);

module.exports = router;

