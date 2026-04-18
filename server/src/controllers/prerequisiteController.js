const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Add prerequisite to a unit
const addPrerequisite = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { unitId, prerequisiteUnitId } = req.body;

    // Validate both units exist
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    const prerequisiteUnit = await prisma.unit.findUnique({
      where: { id: prerequisiteUnitId },
    });

    if (!prerequisiteUnit) {
      return res.status(404).json({ error: "Prerequisite unit not found" });
    }

    // Check if prerequisite already exists
    const existingPrereq = await prisma.prerequisite.findFirst({
      where: {
        unitId,
        prerequisiteUnitId,
      },
    });

    if (existingPrereq) {
      return res
        .status(400)
        .json({ error: "This prerequisite already exists" });
    }

    // Create prerequisite
    const prerequisite = await prisma.prerequisite.create({
      data: {
        unitId,
        prerequisiteUnitId,
      },
      include: {
        unit: true,
        prerequisiteUnit: true,
      },
    });

    res.status(201).json({
      message: "Prerequisite added successfully",
      prerequisite,
    });
  } catch (error) {
    console.error("Error adding prerequisite:", error);
    res.status(500).json({ error: "Error adding prerequisite" });
  }
};

// Get prerequisites for a unit
const getUnitPrerequisites = async (req, res) => {
  try {
    const { unitId } = req.params;

    // Validate unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    // Get prerequisites
    const prerequisites = await prisma.prerequisite.findMany({
      where: { unitId },
      include: {
        prerequisiteUnit: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Prerequisites retrieved successfully",
      prerequisites,
    });
  } catch (error) {
    console.error("Error fetching prerequisites:", error);
    res.status(500).json({ error: "Error fetching prerequisites" });
  }
};

// Check if student meets prerequisites for a unit
const checkPrerequisites = async (req, res) => {
  try {
    const { unitId } = req.params;
    const userId = req.user.id;

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get unit prerequisites
    const prerequisites = await prisma.prerequisite.findMany({
      where: { unitId },
      select: { prerequisiteUnitId: true },
    });

    if (prerequisites.length === 0) {
      return res.status(200).json({
        met: true,
        message: "No prerequisites required for this unit",
      });
    }

    const prerequisiteUnitIds = prerequisites.map((p) => p.prerequisiteUnitId);

    // Check if student has completed all prerequisites with passing grades
    const completedPrerequisites = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        unitId: {
          in: prerequisiteUnitIds,
        },
        grade: {
          isNot: null,
        },
      },
      include: {
        grade: true,
        unit: true,
      },
    });

    const completedUnitIds = completedPrerequisites.map((e) => e.unitId);
    const unmetPrerequisites = prerequisiteUnitIds.filter(
      (id) => !completedUnitIds.includes(id),
    );

    const met = unmetPrerequisites.length === 0;

    res.status(200).json({
      met,
      message: met ? "All prerequisites met" : "Some prerequisites not met",
      unmetPrerequisites:
        unmetPrerequisites.length > 0 ? unmetPrerequisites : [],
      completedPrerequisites: completedPrerequisites.map((e) => ({
        unitCode: e.unit.code,
        unitName: e.unit.name,
        grade: e.grade.grade,
      })),
    });
  } catch (error) {
    console.error("Error checking prerequisites:", error);
    res.status(500).json({ error: "Error checking prerequisites" });
  }
};

// Remove prerequisite
const removePrerequisite = async (req, res) => {
  try {
    const { prerequisiteId } = req.params;

    // Verify prerequisite exists
    const prerequisite = await prisma.prerequisite.findUnique({
      where: { id: prerequisiteId },
    });

    if (!prerequisite) {
      return res.status(404).json({ error: "Prerequisite not found" });
    }

    // Delete prerequisite
    await prisma.prerequisite.delete({
      where: { id: prerequisiteId },
    });

    res.status(200).json({
      message: "Prerequisite removed successfully",
    });
  } catch (error) {
    console.error("Error removing prerequisite:", error);
    res.status(500).json({ error: "Error removing prerequisite" });
  }
};

module.exports = {
  addPrerequisite,
  getUnitPrerequisites,
  checkPrerequisites,
  removePrerequisite,
};
