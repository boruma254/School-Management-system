const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

const SALT_ROUNDS = 10;

async function createStudent(data, currentUser) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    const err = new Error('Only admin can create students');
    err.statusCode = 403;
    throw err;
  }

  const { fullName, email, password, admissionNumber, programId, currentSemester, status, departmentId } =
    data;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName,
        email,
        password, // hashed at controller layer for reuse with other modules if needed
        role: 'STUDENT',
      },
    });

    const student = await tx.student.create({
      data: {
        admissionNumber,
        programId,
        currentSemester,
        status,
        userId: user.id,
        departmentId: departmentId || null,
      },
      include: {
        user: true,
        program: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE_STUDENT',
        entity: `Student:${student.id}`,
      },
    });

    return student;
  });
}

async function listStudents() {
  return prisma.student.findMany({
    include: {
      user: true,
      program: true,
      department: true,
    },
  });
}

async function getStudentById(id) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      program: true,
      enrollments: {
        include: {
          unit: true,
          grade: true,
        },
      },
      payments: true,
      department: true,
    },
  });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }
  return student;
}

async function getStudentByUserId(userId) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: true,
      program: true,
      enrollments: {
        include: {
          unit: true,
          grade: true,
        },
      },
      payments: true,
      department: true,
    },
  });
  if (!student) {
    const err = new Error('Student profile not found for this account');
    err.statusCode = 404;
    throw err;
  }
  return student;
}

async function updateStudent(id, data, currentUser) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    const err = new Error('Only admin can update students');
    err.statusCode = 403;
    throw err;
  }

  const student = await prisma.student.update({
    where: { id },
    data,
    include: {
      user: true,
      program: true,
      department: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser.id,
      action: 'UPDATE_STUDENT',
      entity: `Student:${student.id}`,
    },
  });

  return student;
}

async function updateMyProfile(userId, data) {
  const { phoneNumber, email, password } = data;

  // Load student + user to ensure the request is for an existing account.
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { user: true, program: true, department: true },
  });

  if (!student) {
    const err = new Error('Student profile not found for this account');
    err.statusCode = 404;
    throw err;
  }

  const updateUserData = {};

  if (phoneNumber !== undefined) {
    updateUserData.phoneNumber =
      phoneNumber === null || phoneNumber === '' ? null : String(phoneNumber);
  }

  if (email !== undefined) {
    const nextEmail = String(email).trim();
    if (nextEmail !== student.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: nextEmail } });
      if (existingUser && existingUser.id !== student.userId) {
        const err = new Error('Email already in use');
        err.statusCode = 400;
        throw err;
      }
      updateUserData.email = nextEmail;
    }
  }

  if (password !== undefined && password !== '') {
    updateUserData.password = await bcrypt.hash(String(password), SALT_ROUNDS);
  }

  const updatedUser = await prisma.user.update({
    where: { id: student.userId },
    data: updateUserData,
  });

  return prisma.student.findUnique({
    where: { userId },
    include: {
      user: true,
      program: true,
      enrollments: {
        include: {
          unit: true,
          grade: true,
        },
      },
      payments: true,
      department: true,
    },
  });
}

async function deleteStudent(id, currentUser) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  // Delete child records first to avoid FK constraint issues.
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
    select: { id: true },
  });
  const enrollmentIds = enrollments.map((e) => e.id);

  if (enrollmentIds.length) {
    await prisma.grade.deleteMany({
      where: { enrollmentId: { in: enrollmentIds } },
    });
    await prisma.enrollment.deleteMany({
      where: { id: { in: enrollmentIds } },
    });
  }

  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
    select: { id: true },
  });
  const paymentIds = payments.map((p) => p.id);

  if (paymentIds.length) {
    await prisma.mpesaTransaction.deleteMany({
      where: { paymentId: { in: paymentIds } },
    });
    await prisma.payment.deleteMany({
      where: { id: { in: paymentIds } },
    });
  }

  // Audit logs point to the user; delete them before deleting the user.
  await prisma.auditLog.deleteMany({
    where: { userId: student.userId },
  });

  await prisma.student.delete({ where: { id } });
  await prisma.user.delete({ where: { id: student.userId } });

  return { message: 'Student deleted' };
}

module.exports = {
  createStudent,
  listStudents,
  getStudentById,
  getStudentByUserId,
  updateStudent,
  updateMyProfile,
  deleteStudent,
};

