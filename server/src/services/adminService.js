const prisma = require('../config/prisma');

async function getDashboardStats() {
  const [totalStudents, totalRevenueAgg, studentsPerDepartment, studentsPerProgram] =
    await Promise.all([
      prisma.student.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { students: true },
          },
        },
      }),
      prisma.program.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { students: true },
          },
        },
      }),
    ]);

  return {
    totalStudents,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
    studentsPerDepartment: studentsPerDepartment.map((d) => ({
      id: d.id,
      name: d.name,
      count: d._count.students,
    })),
    studentsPerProgram: studentsPerProgram.map((p) => ({
      id: p.id,
      name: p.name,
      count: p._count.students,
    })),
  };
}

async function listPendingStudentApprovals() {
  return prisma.student.findMany({
    where: { status: 'PENDING' },
    include: {
      user: true,
      program: true,
      department: true,
    },
  });
}

async function approveStudentByAdmissionNumber(admissionNumber, currentUser) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const student = await prisma.student.findUnique({
    where: { admissionNumber },
    include: { user: true },
  });

  if (!student) {
    const err = new Error('Student request not found');
    err.statusCode = 404;
    throw err;
  }

  if (student.status !== 'PENDING') {
    const err = new Error('Student is not pending approval');
    err.statusCode = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: student.userId },
      data: { isActive: true },
    });

    const updated = await tx.student.update({
      where: { id: student.id },
      data: { status: 'ACTIVE' },
      include: {
        user: true,
        program: true,
        department: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'APPROVE_STUDENT_SIGNUP',
        entity: `Student:${updated.id}`,
      },
    });

    return updated;
  });
}

module.exports = {
  getDashboardStats,
  listPendingStudentApprovals,
  approveStudentByAdmissionNumber,
};

