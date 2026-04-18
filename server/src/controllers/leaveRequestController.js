const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Submit leave request
const submitLeaveRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { reason, startDate, endDate } = req.body;

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    // Check for overlapping leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        studentId: student.id,
        status: {
          in: ["PENDING", "APPROVED"],
        },
        OR: [
          {
            startDate: {
              lte: end,
            },
            endDate: {
              gte: start,
            },
          },
        ],
      },
    });

    if (overlapping) {
      return res
        .status(400)
        .json({ error: "You already have an overlapping leave request" });
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        reason,
        startDate: start,
        endDate: end,
      },
    });

    res.status(201).json({
      message: "Leave request submitted successfully",
      leaveRequest,
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({ error: "Error submitting leave request" });
  }
};

// Get student's leave requests
const getMyLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get leave requests
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { studentId: student.id },
      orderBy: { requestedAt: "desc" },
    });

    res.status(200).json({
      message: "Leave requests retrieved successfully",
      leaveRequests,
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Error fetching leave requests" });
  }
};

// Get all leave requests (admin/lecturer)
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, studentId } = req.query;

    let where = {};

    if (status) {
      where.status = status;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    res.status(200).json({
      message: "Leave requests retrieved successfully",
      leaveRequests,
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Error fetching leave requests" });
  }
};

// Approve leave request
const approveLeaveRequest = async (req, res) => {
  try {
    const { leaveRequestId } = req.params;
    const { approvalNotes } = req.body;

    // Find leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    // Update leave request
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: "APPROVED",
        respondedAt: new Date(),
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        title: "Leave Request Approved",
        message: `Your leave request from ${leaveRequest.startDate.toDateString()} to ${leaveRequest.endDate.toDateString()} has been approved.`,
        type: "leave_approval",
        studentId: leaveRequest.studentId,
      },
    });

    res.status(200).json({
      message: "Leave request approved successfully",
      leaveRequest: updated,
    });
  } catch (error) {
    console.error("Error approving leave request:", error);
    res.status(500).json({ error: "Error approving leave request" });
  }
};

// Reject leave request
const rejectLeaveRequest = async (req, res) => {
  try {
    const { leaveRequestId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    // Find leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    // Update leave request
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: "REJECTED",
        rejectionReason,
        respondedAt: new Date(),
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        title: "Leave Request Rejected",
        message: `Your leave request has been rejected. Reason: ${rejectionReason}`,
        type: "leave_rejection",
        studentId: leaveRequest.studentId,
      },
    });

    res.status(200).json({
      message: "Leave request rejected successfully",
      leaveRequest: updated,
    });
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    res.status(500).json({ error: "Error rejecting leave request" });
  }
};

// Cancel leave request (student only)
const cancelLeaveRequest = async (req, res) => {
  try {
    const { leaveRequestId } = req.params;
    const userId = req.user.id;

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Find leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
    });

    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    // Verify ownership
    if (leaveRequest.studentId !== student.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if can be cancelled (only PENDING)
    if (leaveRequest.status !== "PENDING") {
      return res
        .status(400)
        .json({ error: "Only pending leave requests can be cancelled" });
    }

    // Delete leave request
    await prisma.leaveRequest.delete({
      where: { id: leaveRequestId },
    });

    res.status(200).json({
      message: "Leave request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling leave request:", error);
    res.status(500).json({ error: "Error cancelling leave request" });
  }
};

module.exports = {
  submitLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
};
