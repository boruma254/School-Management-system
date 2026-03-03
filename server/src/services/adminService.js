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

module.exports = {
  getDashboardStats,
};

