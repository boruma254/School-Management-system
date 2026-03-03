const express = require('express');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const academicRoutes = require('./academicRoutes');
const financeRoutes = require('./financeRoutes');
const adminRoutes = require('./adminRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const { mpesaCallback } = require('../controllers/financeController');

const router = express.Router();

router.use('/auth', authRoutes);

// M-Pesa callback must be publicly accessible (no JWT)
router.post('/finance/mpesa/callback', mpesaCallback);

// All routes below this require authentication
router.use(authMiddleware);

router.use('/students', studentRoutes);
router.use('/academic', academicRoutes);
router.use('/finance', financeRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

