const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Create schedule/class time
const createSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { unitId, dayOfWeek, startTime, endTime, room, lecturerId } =
      req.body;

    // Validate unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    // Create schedule
    const schedule = await prisma.schedule.create({
      data: {
        unitId,
        dayOfWeek,
        startTime,
        endTime,
        room,
        lecturerId,
      },
      include: {
        unit: true,
      },
    });

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Error creating schedule" });
  }
};

// Get schedule for a unit
const getUnitSchedule = async (req, res) => {
  try {
    const { unitId } = req.params;

    const schedules = await prisma.schedule.findMany({
      where: { unitId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    res.status(200).json({
      message: "Unit schedules retrieved successfully",
      schedules,
    });
  } catch (error) {
    console.error("Error fetching unit schedule:", error);
    res.status(500).json({ error: "Error fetching schedule" });
  }
};

// Get full timetable for a student
const getStudentTimetable = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get enrollments for current semester
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        semester: student.currentSemester,
      },
      include: {
        unit: true,
      },
    });

    // Get schedules for enrolled units
    const unitIds = enrollments.map((e) => e.unit.id);

    const schedules = await prisma.schedule.findMany({
      where: {
        unitId: {
          in: unitIds,
        },
      },
      include: {
        unit: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    res.status(200).json({
      message: "Student timetable retrieved successfully",
      schedules,
    });
  } catch (error) {
    console.error("Error fetching student timetable:", error);
    res.status(500).json({ error: "Error fetching timetable" });
  }
};

// Get timetable for a lecturer
const getLecturerTimetable = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get lecturer
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId },
    });

    if (!lecturer) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    // Get schedules assigned to lecturer
    const schedules = await prisma.schedule.findMany({
      where: {
        lecturerId: lecturer.id,
      },
      include: {
        unit: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    res.status(200).json({
      message: "Lecturer timetable retrieved successfully",
      schedules,
    });
  } catch (error) {
    console.error("Error fetching lecturer timetable:", error);
    res.status(500).json({ error: "Error fetching timetable" });
  }
};

// Update schedule
const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { dayOfWeek, startTime, endTime, room, lecturerId } = req.body;

    // Verify schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Update schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        dayOfWeek: dayOfWeek || schedule.dayOfWeek,
        startTime: startTime || schedule.startTime,
        endTime: endTime || schedule.endTime,
        room: room || schedule.room,
        lecturerId: lecturerId || schedule.lecturerId,
      },
    });

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: "Error updating schedule" });
  }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    res.status(200).json({
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: "Error deleting schedule" });
  }
};

module.exports = {
  createSchedule,
  getUnitSchedule,
  getStudentTimetable,
  getLecturerTimetable,
  updateSchedule,
  deleteSchedule,
};
