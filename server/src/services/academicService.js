const prisma = require("../config/prisma");

async function createDepartment(name) {
  return prisma.department.create({ data: { name } });
}

async function listDepartments() {
  return prisma.department.findMany({
    include: {
      programs: true,
      students: true,
    },
  });
}

async function createProgram(data) {
  return prisma.program.create({
    data: {
      name: data.name,
      departmentId: data.departmentId,
    },
  });
}

async function listPrograms() {
  return prisma.program.findMany({
    include: {
      department: true,
      students: true,
    },
  });
}

async function createUnit(data) {
  return prisma.unit.create({
    data: {
      code: data.code,
      name: data.name,
      programId: data.programId,
      semester: data.semester,
    },
  });
}

async function listUnits() {
  return prisma.unit.findMany({
    include: {
      program: true,
    },
  });
}

async function getUnitEnrollments(unitId) {
  return prisma.enrollment.findMany({
    where: { unitId },
    include: {
      student: {
        include: {
          user: true,
          program: true,
        },
      },
      unit: true,
      grade: true,
    },
    orderBy: {
      student: {
        user: {
          fullName: "asc",
        },
      },
    },
  });
}

async function enrollStudent(data) {
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: data.studentId,
      unitId: data.unitId,
      semester: data.semester,
    },
  });
  return enrollment;
}

async function recordGrade(data) {
  const totalScore = data.catScore + data.examScore;
  let gradeLetter = "F";
  if (totalScore >= 80) gradeLetter = "A";
  else if (totalScore >= 70) gradeLetter = "B";
  else if (totalScore >= 60) gradeLetter = "C";
  else if (totalScore >= 50) gradeLetter = "D";

  const grade = await prisma.grade.upsert({
    where: { enrollmentId: data.enrollmentId },
    create: {
      enrollmentId: data.enrollmentId,
      catScore: data.catScore,
      examScore: data.examScore,
      totalScore,
      grade: gradeLetter,
    },
    update: {
      catScore: data.catScore,
      examScore: data.examScore,
      totalScore,
      grade: gradeLetter,
    },
  });

  return grade;
}

async function getDepartmentOverview(departmentId) {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      programs: {
        include: {
          units: true,
        },
      },
      lecturers: {
        include: {
          user: true,
        },
      },
      students: {
        include: {
          user: true,
          program: true,
          enrollments: {
            include: {
              unit: true,
            },
          },
          payments: true,
        },
      },
    },
  });

  if (!department) {
    const err = new Error("Department not found");
    err.statusCode = 404;
    throw err;
  }

  const allUnits = new Map();
  for (const prog of department.programs) {
    for (const u of prog.units) {
      allUnits.set(u.id, u);
    }
  }

  const students = department.students.map((s) => {
    const unitsRegistered = s.enrollments.length;
    const classesAttended = unitsRegistered * 14;
    const units = s.enrollments.map((e) => e.unit).filter(Boolean);
    const totalPaid = s.payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      id: s.id,
      admissionNumber: s.admissionNumber,
      fullName: s.user?.fullName || null,
      email: s.user?.email || null,
      currentSemester: s.currentSemester,
      status: s.status,
      program: s.program ? { id: s.program.id, name: s.program.name } : null,
      unitsRegistered,
      classesAttended,
      units: units.map((u) => ({
        id: u.id,
        code: u.code,
        name: u.name,
        semester: u.semester,
      })),
      totalPaid,
    };
  });

  const lecturers = department.lecturers.map((l) => ({
    id: l.id,
    fullName: l.user?.fullName || null,
    email: l.user?.email || null,
  }));

  return {
    id: department.id,
    name: department.name,
    totalStudents: students.length,
    totalPrograms: department.programs.length,
    totalUnits: allUnits.size,
    lecturers,
    students,
  };
}

async function createLecturerDocument(data) {
  return prisma.lecturerDocument.create({
    data: {
      title: data.title,
      description: data.description,
      filePath: data.filePath,
      lecturerId: data.lecturerId,
    },
    include: {
      lecturer: {
        include: {
          user: true,
        },
      },
    },
  });
}

async function listLecturerDocuments() {
  return prisma.lecturerDocument.findMany({
    include: {
      lecturer: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getLecturerByUserId(userId) {
  return prisma.lecturer.findUnique({
    where: { userId },
  });
}

async function createChatRoom(data) {
  return prisma.chatRoom.create({
    data: {
      name: data.name,
      unitId: data.unitId,
    },
  });
}

async function listChatRooms() {
  return prisma.chatRoom.findMany({
    include: {
      unit: true,
      messages: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1, // Just get the latest message for preview
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function createChatMessage(data) {
  return prisma.chatMessage.create({
    data: {
      roomId: data.roomId,
      userId: data.userId,
      message: data.content,
    },
    include: {
      user: true,
      room: true,
    },
  });
}

async function getChatMessages(roomId, limit = 50) {
  return prisma.chatMessage.findMany({
    where: { roomId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });
}

module.exports = {
  createDepartment,
  listDepartments,
  createProgram,
  listPrograms,
  createUnit,
  listUnits,
  getUnitEnrollments,
  enrollStudent,
  recordGrade,
  getDepartmentOverview,
  createLecturerDocument,
  listLecturerDocuments,
  getLecturerByUserId,
  createChatRoom,
  listChatRooms,
  createChatMessage,
  getChatMessages,
};
