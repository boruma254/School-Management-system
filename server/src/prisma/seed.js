require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function computeGradeLetter(catScore, examScore) {
  const totalScore = catScore + examScore;
  if (totalScore >= 80) return 'A';
  if (totalScore >= 70) return 'B';
  if (totalScore >= 60) return 'C';
  if (totalScore >= 50) return 'D';
  return 'F';
}

function padNumber(n, width = 4) {
  return String(n).padStart(width, '0');
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // Shared demo dataset (used by portals)
  const departmentName = 'School of Computer Science';
  const programName = 'BSc Information Technology';
  const semester = 1;

  // Create academic structure
  const department = await prisma.department.upsert({
    where: { name: departmentName },
    update: {},
    create: { name: departmentName },
  });

  let program = await prisma.program.findFirst({
    where: { name: programName, departmentId: department.id },
  });
  if (!program) {
    program = await prisma.program.create({
      data: { name: programName, departmentId: department.id },
    });
  }

  const unitsSeed = [
    { code: 'CS101', name: 'Introduction to Programming', semester },
    { code: 'CS102', name: 'Data Structures', semester },
  ];

  const units = [];
  for (const u of unitsSeed) {
    // Unit uniqueness in DB is not enforced; use (code, programId, semester) as a seed key.
    let unit = await prisma.unit.findFirst({
      where: {
        code: u.code,
        programId: program.id,
        semester: u.semester,
      },
    });
    if (!unit) {
      unit = await prisma.unit.create({
        data: {
          code: u.code,
          name: u.name,
          programId: program.id,
          semester: u.semester,
        },
      });
    }
    units.push(unit);
  }

  // Fee structure for the current semester
  const feeAmount = 50000;
  const feeStructure = await prisma.feeStructure.findFirst({
    where: { programId: program.id, semester },
  });
  if (!feeStructure) {
    await prisma.feeStructure.create({
      data: { programId: program.id, semester, amount: feeAmount },
    });
  }

  const roles = [
    {
      email: 'admin@kisitvet.local',
      fullName: 'System Administrator',
      password: 'Admin@12345',
      role: 'ADMIN',
      phoneNumber: '0712340001',
    },
    {
      email: 'lecturer@kisitvet.local',
      fullName: 'Lecturer One',
      password: 'Lecturer@12345',
      role: 'LECTURER',
      phoneNumber: '0712340002',
    },
    {
      email: 'student@kisitvet.local',
      fullName: 'Student One',
      password: 'Student@12345',
      role: 'STUDENT',
      phoneNumber: '0712340003',
    },
    {
      email: 'finance@kisitvet.local',
      fullName: 'Finance Officer',
      password: 'Finance@12345',
      role: 'FINANCE',
      phoneNumber: '0712340004',
    },
  ];

  const usersByRole = {};
  for (const r of roles) {
    const passwordHash = await bcrypt.hash(r.password, 10);
    let user = await prisma.user.findUnique({ where: { email: r.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: r.fullName,
          email: r.email,
          password: passwordHash,
          role: r.role,
          isActive: true,
          phoneNumber: r.phoneNumber || null,
        },
      });
      console.log(`Created user: ${r.email}`);
    } else {
      // Ensure user remains active (don't overwrite password to avoid surprises).
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true, phoneNumber: r.phoneNumber || null },
      });
    }
    usersByRole[r.role] = user;
  }

  // Lecturer profile
  const lecturerUser = usersByRole['LECTURER'];
  if (lecturerUser) {
    const existingLecturer = await prisma.lecturer.findUnique({
      where: { userId: lecturerUser.id },
    });
    if (!existingLecturer) {
      await prisma.lecturer.create({
        data: {
          userId: lecturerUser.id,
          departmentId: department.id,
        },
      });
    }
  }

  // Student profile, enrollments, grades, payments
  const studentUser = usersByRole['STUDENT'];
  if (studentUser) {
    const admissionNumber = 'ADM-1001';
    let student = await prisma.student.findUnique({
      where: { admissionNumber },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          admissionNumber,
          userId: studentUser.id,
          programId: program.id,
          currentSemester: semester,
          status: 'ACTIVE',
          departmentId: department.id,
        },
      });
    } else {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          userId: studentUser.id,
          programId: program.id,
          currentSemester: semester,
          status: 'ACTIVE',
          departmentId: department.id,
        },
      });
    }

    // Ensure enrollments + grades
    const enrollmentSeed = [
      // CS101
      {
        unitCode: 'CS101',
        catScore: 25,
        examScore: 60,
      },
      // CS102
      {
        unitCode: 'CS102',
        catScore: 30,
        examScore: 45,
      },
    ];

    for (const es of enrollmentSeed) {
      const unit = units.find((x) => x.code === es.unitCode);
      if (!unit) continue;

      let enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          unitId: unit.id,
          semester,
        },
      });

      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: {
            studentId: student.id,
            unitId: unit.id,
            semester,
          },
        });
      }

      const gradeLetter = computeGradeLetter(es.catScore, es.examScore);
      const totalScore = es.catScore + es.examScore;

      // Grade is keyed by enrollmentId (unique)
      await prisma.grade.upsert({
        where: { enrollmentId: enrollment.id },
        create: {
          enrollmentId: enrollment.id,
          catScore: es.catScore,
          examScore: es.examScore,
          totalScore,
          grade: gradeLetter,
        },
        update: {
          catScore: es.catScore,
          examScore: es.examScore,
          totalScore,
          grade: gradeLetter,
        },
      });
    }

    // Ensure at least one successful payment
    const transactionRef = 'TXN-STU-001';
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionRef },
    });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          studentId: student.id,
          amount: 20000,
          method: 'MPESA',
          transactionRef,
          status: 'SUCCESS',
        },
      });
    }
  }

  // Bulk demo students (for testing dashboards & CRUD flows)
  const firstNames = [
    'Amina',
    'Brian',
    'Cynthia',
    'Dennis',
    'Esther',
    'Faith',
    'George',
    'Hassan',
    'Ivy',
    'James',
    'Kevin',
    'Linda',
    'Mary',
    'Nancy',
    'Oscar',
    'Peter',
    'Queen',
    'Ruth',
    'Samuel',
    'Terry',
    'Victor',
    'Winnie',
    'Yusuf',
    'Zainab',
  ];
  const lastNames = [
    'Omondi',
    'Wanjiku',
    'Mutiso',
    'Kamau',
    'Odhiambo',
    'Chebet',
    'Njoroge',
    'Kiptoo',
    'Wekesa',
    'Mwangi',
    'Achieng',
    'Maina',
    'Otieno',
    'Mbugua',
    'Barasa',
    'Onyango',
  ];

  for (let i = 1; i <= 50; i += 1) {
    const suffix = padNumber(i, 3);
    const admissionNumber = `ADM-${2000 + i}`;
    const email = `student${suffix}@kisitvet.local`;
    const fullName = `${firstNames[i % firstNames.length]} ${
      lastNames[i % lastNames.length]
    }`;
    const phoneNumber = `07123${padNumber(5000 + i, 5)}`;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash('Student@12345', 10);
      user = await prisma.user.create({
        data: {
          fullName,
          email,
          password: passwordHash,
          role: 'STUDENT',
          isActive: true,
          phoneNumber,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true, fullName, phoneNumber },
      });
    }

    let student = await prisma.student.findUnique({
      where: { admissionNumber },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          admissionNumber,
          userId: user.id,
          programId: program.id,
          currentSemester: semester,
          status: 'ACTIVE',
          departmentId: department.id,
        },
      });
    } else {
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          userId: user.id,
          programId: program.id,
          currentSemester: semester,
          status: 'ACTIVE',
          departmentId: department.id,
        },
      });
    }

    // Enroll in all seeded units + create grades
    for (const unit of units) {
      let enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          unitId: unit.id,
          semester,
        },
      });

      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: {
            studentId: student.id,
            unitId: unit.id,
            semester,
          },
        });
      }

      const catScore = randInt(15, 30); // /30
      const examScore = randInt(25, 70); // /70
      const totalScore = catScore + examScore;
      const gradeLetter = computeGradeLetter(catScore, examScore);

      await prisma.grade.upsert({
        where: { enrollmentId: enrollment.id },
        create: {
          enrollmentId: enrollment.id,
          catScore,
          examScore,
          totalScore,
          grade: gradeLetter,
        },
        update: {
          catScore,
          examScore,
          totalScore,
          grade: gradeLetter,
        },
      });
    }

    // Payment (some fully paid, some partial)
    const transactionRef = `TXN-STU-${suffix}`;
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionRef },
    });
    if (!existingPayment) {
      const amount = i % 3 === 0 ? 50000 : i % 3 === 1 ? 20000 : 35000;
      await prisma.payment.create({
        data: {
          studentId: student.id,
          amount,
          method: i % 2 === 0 ? 'MPESA' : 'CASH',
          transactionRef,
          status: 'SUCCESS',
        },
      });
    }
  }

  // Pending student (for testing signup approval flow)
  const pendingEmail = 'pendingstudent@kisitvet.local';
  const pendingAdmissionNumber = 'ADM-PENDING-0001';
  const pendingCurrentSemester = semester;

  let pendingUser = await prisma.user.findUnique({
    where: { email: pendingEmail },
  });
  if (!pendingUser) {
    const passwordHash = await bcrypt.hash('Pending@12345', 10);
    pendingUser = await prisma.user.create({
      data: {
        fullName: 'Pending Student',
        email: pendingEmail,
        password: passwordHash,
        role: 'STUDENT',
        isActive: false,
        phoneNumber: '0712340999',
      },
    });
    console.log(`Created user: ${pendingEmail}`);
  }

  const existingPendingStudent = await prisma.student.findUnique({
    where: { admissionNumber: pendingAdmissionNumber },
  });
  if (!existingPendingStudent) {
    await prisma.student.create({
      data: {
        admissionNumber: pendingAdmissionNumber,
        userId: pendingUser.id,
        programId: program.id,
        currentSemester: pendingCurrentSemester,
        status: 'PENDING',
        departmentId: department.id,
      },
    });
  } else {
    await prisma.student.update({
      where: { id: existingPendingStudent.id },
      data: {
        userId: pendingUser.id,
        programId: program.id,
        currentSemester: pendingCurrentSemester,
        status: 'PENDING',
        departmentId: department.id,
      },
    });
  }

  console.log('Seed complete (demo dataset ready).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

