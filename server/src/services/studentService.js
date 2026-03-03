const prisma = require('../config/prisma');

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

module.exports = {
  createStudent,
  listStudents,
  getStudentById,
  getStudentByUserId,
  updateStudent,
};

