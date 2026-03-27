const prisma = require('../config/prisma');

async function getFinanceSummary() {
  const successfulPayments = await prisma.payment.findMany({
    where: { status: 'SUCCESS' },
    include: {
      student: {
        include: {
          user: true,
          program: {
            include: {
              department: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = successfulPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const perProgram = new Map();
  const perStudent = new Map();

  for (const p of successfulPayments) {
    const student = p.student;
    if (!student) continue;

    const program = student.program;
    const programKey = program ? program.id : 'unknown';
    if (!perProgram.has(programKey)) {
      perProgram.set(programKey, {
        programId: program ? program.id : null,
        programName: program ? program.name : 'Unassigned program',
        departmentName: program?.department?.name || null,
        studentCount: 0,
        revenue: 0,
        students: new Set(),
      });
    }
    const progAgg = perProgram.get(programKey);
    progAgg.revenue += p.amount || 0;
    progAgg.students.add(student.id);

    const studentKey = student.id;
    if (!perStudent.has(studentKey)) {
      perStudent.set(studentKey, {
        studentId: student.id,
        admissionNumber: student.admissionNumber,
        fullName: student.user?.fullName || null,
        programName: program ? program.name : null,
        totalPaid: 0,
        paymentsCount: 0,
      });
    }
    const stuAgg = perStudent.get(studentKey);
    stuAgg.totalPaid += p.amount || 0;
    stuAgg.paymentsCount += 1;
  }

  const programBreakdown = Array.from(perProgram.values()).map((p) => ({
    programId: p.programId,
    programName: p.programName,
    departmentName: p.departmentName,
    studentCount: p.students.size,
    revenue: p.revenue,
  }));

  const studentBreakdown = Array.from(perStudent.values()).map((s) => ({
    studentId: s.studentId,
    admissionNumber: s.admissionNumber,
    fullName: s.fullName,
    programName: s.programName,
    totalPaid: s.totalPaid,
    paymentsCount: s.paymentsCount,
  }));

  return {
    totalRevenue,
    totalSuccessfulPayments: successfulPayments.length,
    totalPayingStudents: studentBreakdown.length,
    programBreakdown,
    studentBreakdown,
  };
}

module.exports = {
  getFinanceSummary,
};

