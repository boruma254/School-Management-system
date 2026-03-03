const prisma = require('../config/prisma');

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
  let gradeLetter = 'F';
  if (totalScore >= 80) gradeLetter = 'A';
  else if (totalScore >= 70) gradeLetter = 'B';
  else if (totalScore >= 60) gradeLetter = 'C';
  else if (totalScore >= 50) gradeLetter = 'D';

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

module.exports = {
  createDepartment,
  listDepartments,
  createProgram,
  listPrograms,
  createUnit,
  listUnits,
  enrollStudent,
  recordGrade,
};

