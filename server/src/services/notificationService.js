const prisma = require("../config/prisma");

async function createNotification(data) {
  return prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type || "announcement",
      studentId: data.studentId,
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

async function createNotificationsForAllStudents(data) {
  const students = await prisma.student.findMany();
  const notifications = [];

  for (const student of students) {
    const notif = await createNotification({
      title: data.title,
      message: data.message,
      type: data.type,
      studentId: student.id,
      lecturerId: data.lecturerId,
    });
    notifications.push(notif);
  }

  return notifications;
}

async function getStudentNotifications(studentId) {
  return prisma.notification.findMany({
    where: { studentId },
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

async function markAsRead(notificationId) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

async function deleteNotification(notificationId) {
  return prisma.notification.delete({
    where: { id: notificationId },
  });
}

module.exports = {
  createNotification,
  createNotificationsForAllStudents,
  getStudentNotifications,
  markAsRead,
  deleteNotification,
};
