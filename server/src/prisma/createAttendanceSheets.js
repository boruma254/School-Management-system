const prisma = require("../config/prisma");

async function main() {
  const lecturerUser = await prisma.user.findUnique({
    where: { email: "lecturer@kisitvet.local" },
  });

  if (!lecturerUser) {
    throw new Error("Lecturer user not found. Run the seed script first.");
  }

  const lecturer = await prisma.lecturer.findUnique({
    where: { userId: lecturerUser.id },
  });

  if (!lecturer) {
    throw new Error("Lecturer profile not found. Run the seed script first.");
  }

  const students = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
    take: 20,
    orderBy: { admissionNumber: "asc" },
  });

  if (!students.length) {
    throw new Error("No active students found in the database.");
  }

  const baseDate = new Date("2026-04-11T00:00:00.000Z");
  const sheetPromises = [];

  for (let sheetIndex = 0; sheetIndex < 10; sheetIndex += 1) {
    const sheetDate = new Date(baseDate);
    sheetDate.setDate(baseDate.getDate() + sheetIndex);

    const title = `Sample Attendance Sheet ${sheetIndex + 1}`;
    const fileName = `attendance_sample_${sheetIndex + 1}.csv`;

    const sheetStudents = students.slice(sheetIndex, sheetIndex + 5);
    const attendanceRows = sheetStudents.map((student, rowIndex) => ({
      studentId: student.id,
      lecturerId: lecturer.id,
      date: new Date(sheetDate),
      status: ["PRESENT", "ABSENT", "LATE"][(sheetIndex + rowIndex) % 3],
    }));

    sheetPromises.push(
      (async () => {
        const sheet = await prisma.attendanceSheet.create({
          data: {
            lecturerId: lecturer.id,
            title,
            fileName,
            filePath: null,
          },
        });

        await prisma.attendance.createMany({
          data: attendanceRows.map((row) => ({
            ...row,
            sheetId: sheet.id,
          })),
        });

        return sheet;
      })(),
    );
  }

  const sheets = await Promise.all(sheetPromises);
  console.log(`Created ${sheets.length} attendance sheets.`);
  sheets.forEach((sheet) => {
    console.log(`- ${sheet.title} (${sheet.id})`);
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
