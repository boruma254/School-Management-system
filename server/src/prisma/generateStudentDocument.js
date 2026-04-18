const { PrismaClient } = require("@prisma/client");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function generateStudentDocument() {
  try {
    // Fetch all students with related data
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            unit: true,
            grade: true,
          },
        },
        attendances: {
          include: {
            sheet: true,
          },
        },
        payments: true,
        user: true,
        program: true,
      },
    });

    // Create PDF document
    const doc = new PDFDocument();
    const outputPath = path.join(__dirname, "../../docs/students-document.pdf");
    doc.pipe(fs.createWriteStream(outputPath));

    // Title
    doc.fontSize(20).text("Student Information Document", { align: "center" });
    doc.moveDown();

    students.forEach((student, index) => {
      if (index > 0) doc.addPage();

      doc
        .fontSize(16)
        .text(`Student ID: ${student.admissionNumber}`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Name: ${student.user.fullName}`);
      doc.text(`Email: ${student.user.email}`);
      doc.text(`Phone: ${student.user.phoneNumber || "N/A"}`);
      doc.text(`Program: ${student.program.name}`);
      doc.text(`Current Semester: ${student.currentSemester}`);
      doc.text(`Status: ${student.status}`);
      doc.moveDown();

      // Enrollments
      if (student.enrollments.length > 0) {
        doc.fontSize(14).text("Enrollments:", { underline: true });
        student.enrollments.forEach((enrollment) => {
          const gradeInfo = enrollment.grade
            ? ` - Grade: ${enrollment.grade.grade} (${enrollment.grade.totalScore})`
            : "";
          doc
            .fontSize(12)
            .text(
              `Unit: ${enrollment.unit.name} (Semester ${enrollment.semester})${gradeInfo}`,
            );
        });
        doc.moveDown();
      }

      // Attendance Summary
      const totalAttendance = student.attendances.length;
      const presentCount = student.attendances.filter(
        (record) => record.status === "PRESENT",
      ).length;
      doc.fontSize(14).text("Attendance Summary:", { underline: true });
      doc
        .fontSize(12)
        .text(`Total Records: ${totalAttendance}, Present: ${presentCount}`);
      doc.moveDown();

      // Payments
      if (student.payments.length > 0) {
        doc.fontSize(14).text("Payments:", { underline: true });
        student.payments.forEach((payment) => {
          doc
            .fontSize(12)
            .text(
              `Amount: ${payment.amount}, Date: ${new Date(payment.createdAt).toLocaleDateString()}, Status: ${payment.status}`,
            );
        });
        doc.moveDown();
      }
    });

    doc.end();
    console.log("Student document generated successfully at:", outputPath);
  } catch (error) {
    console.error("Error generating student document:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateStudentDocument();
