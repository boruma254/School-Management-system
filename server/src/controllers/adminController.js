const adminService = require('../services/adminService');

async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
};

