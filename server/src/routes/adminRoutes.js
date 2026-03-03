const express = require('express');
const authorizeRoles = require('../middleware/roleMiddleware');
const { getDashboard } = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', authorizeRoles('ADMIN', 'FINANCE'), getDashboard);

module.exports = router;

