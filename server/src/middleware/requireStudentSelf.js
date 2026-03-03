const prisma = require('../config/prisma');

async function requireStudentSelfByStudentIdParam(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'STUDENT') return next();

    const studentId = req.params.id || req.params.studentId;
    if (!studentId) return next();

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requireStudentSelfByStudentIdParam,
};

