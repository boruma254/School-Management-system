# TVET ERP System - New Features Implementation Guide

## 📋 Overview

This document outlines all newly implemented features in the TVET ERP System as of April 18, 2026.

---

## 🔐 1. Password Reset System

### Endpoints

- **POST** `/api/password-reset/request` - Request password reset
- **POST** `/api/password-reset/reset` - Reset password with token
- **GET** `/api/password-reset/verify?token=...` - Verify reset token

### Flow

1. User visits `/request-password-reset` and enters email
2. System sends email with reset link
3. Link contains token: `/reset-password?token=<TOKEN>`
4. User clicks link, token is verified
5. User enters new password, submitted to `/reset` endpoint
6. Password is updated, token is marked as used

### Frontend Pages

- `RequestPasswordResetPage.jsx` - Request reset page
- `ResetPasswordPage.jsx` - Password reset form

### Configuration

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@tvet-erp.local
FRONTEND_URL=http://localhost:5173
```

---

## 📅 2. Schedule & Timetable Management

### Endpoints

- **POST** `/api/schedules` - Create schedule (Admin/Lecturer)
- **GET** `/api/schedules/unit/:unitId` - Get unit schedule
- **GET** `/api/schedules/student/timetable` - Get student timetable
- **GET** `/api/schedules/lecturer/timetable` - Get lecturer timetable
- **PUT** `/api/schedules/:scheduleId` - Update schedule
- **DELETE** `/api/schedules/:scheduleId` - Delete schedule

### Features

- Schedule classes by day, time, and room
- View student timetable based on enrolled units
- Lecturer can view assigned classes
- Automatic weekend support (Monday-Sunday)

### Frontend Pages

- `TimetablePage.jsx` - Student/Lecturer timetable view

### Database

```sql
Model: Schedule
- id (UUID)
- unitId (FK to Unit)
- dayOfWeek (MONDAY, TUESDAY, ..., SUNDAY)
- startTime (HH:MM format)
- endTime (HH:MM format)
- room (optional)
- lecturerId (FK to Lecturer)
```

---

## 🎓 3. Course Prerequisites System

### Endpoints

- **POST** `/api/prerequisites` - Add prerequisite (Admin)
- **GET** `/api/prerequisites/unit/:unitId` - Get unit prerequisites
- **GET** `/api/prerequisites/:unitId/check` - Check if student meets prerequisites
- **DELETE** `/api/prerequisites/:prerequisiteId` - Remove prerequisite

### Features

- Prevent students from registering for units without meeting prerequisites
- Automatic validation during enrollment
- View prerequisite requirements
- Admin can manage prerequisites

### Integration

When a student tries to enroll in a unit:

```javascript
// Check prerequisites first
GET / api / prerequisites / { unitId } / check;
// Returns: { met: boolean, unmetPrerequisites: [...], completedPrerequisites: [...] }
```

### Database

```sql
Model: Prerequisite
- id (UUID)
- unitId (FK to Unit)
- prerequisiteUnitId (FK to Unit)
- unique(unitId, prerequisiteUnitId)
```

---

## 🗓️ 4. Leave Request Management

### Endpoints

- **POST** `/api/leave-requests` - Submit leave request (Student)
- **GET** `/api/leave-requests/my/requests` - Get my requests (Student)
- **GET** `/api/leave-requests` - Get all requests (Admin/Lecturer)
- **PUT** `/api/leave-requests/:id/approve` - Approve (Admin)
- **PUT** `/api/leave-requests/:id/reject` - Reject (Admin)
- **DELETE** `/api/leave-requests/:id` - Cancel (Student)

### Features

- Students submit leave requests with reason and dates
- 1-hour duration minimum for leaves
- Admin approval workflow
- Automatic notifications on approval/rejection
- Cannot have overlapping leave requests

### Frontend Pages

- `LeaveRequestPage.jsx` - Student leave request interface
- `AdminLeaveManagementPage.jsx` - Admin approval dashboard

### Workflow

1. Student submits leave request (PENDING)
2. Admin reviews and approves/rejects (APPROVED/REJECTED)
3. Student receives notification
4. Can only cancel PENDING requests

### Database

```sql
Model: LeaveRequest
- id (UUID)
- studentId (FK to Student)
- reason (text, min 10 chars)
- startDate (DateTime)
- endDate (DateTime)
- status (PENDING, APPROVED, REJECTED)
- rejectionReason (optional)
- requestedAt (DateTime)
- respondedAt (DateTime, optional)
```

---

## 📧 5. Email Notification Service

### Service: `emailService.js`

#### Functions

```javascript
sendPasswordResetEmail(email, resetToken, userName);
sendWelcomeEmail(email, userName, role);
sendNotificationEmail(email, userName, title, message);
sendFeeReminderEmail(email, userName, amountDue, dueDate);
sendAssignmentDeadlineEmail(email, userName, assignmentTitle, deadline);
```

#### Configuration

```env
EMAIL_SERVICE=gmail  # or any nodemailer-supported service
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail: use app password
EMAIL_FROM=noreply@tvet-erp.local
```

#### Gmail Setup

1. Enable 2FA on your Google account
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Use this password in EMAIL_PASSWORD

#### Usage in Code

```javascript
const { sendFeeReminderEmail } = require("../services/emailService");

// Send email
await sendFeeReminderEmail(
  "student@example.com",
  "John Doe",
  5000,
  "2026-05-30",
);
```

---

## 📱 6. SMS Notification Service

### Service: `smsService.js`

#### Functions

```javascript
sendSMS(phoneNumber, message);
sendFeeReminderSMS(phoneNumber, amountDue);
sendAssignmentDeadlineSMS(phoneNumber, assignmentTitle);
sendAttendanceAlertSMS(phoneNumber, attendancePercentage);
sendPaymentConfirmationSMS(phoneNumber, amount, reference);
```

#### Configuration

```env
# Twilio (can replace with Africa's Talking SDK)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Usage

```javascript
const { sendFeeReminderSMS } = require("../services/smsService");

// Send SMS
await sendFeeReminderSMS("+254712345678", 5000);
```

---

## 🔐 7. Two-Factor Authentication (Prepared)

### Current Status

- Dependencies installed: `speakeasy`
- Database model created: `TwoFactorAuth`
- Ready for implementation

### Planned Endpoints

- POST `/api/auth/2fa/enable` - Enable 2FA
- POST `/api/auth/2fa/verify` - Verify 2FA code
- GET `/api/auth/2fa/backup-codes` - Get backup codes

---

## 📊 8. Advanced Reporting (Ready)

### Prepared Endpoints

- GET `/api/reports/students` - Student performance
- GET `/api/reports/finance` - Finance summary
- GET `/api/reports/attendance` - Attendance analytics
- GET `/api/reports/enrollment` - Enrollment statistics

---

## 🔄 9. CSV Bulk Import (Ready)

### Planned Endpoint

- POST `/api/admin/import/students` - Bulk student import

---

## 🔗 10. Integration Points

### With Existing Features

#### Enrollment Flow

```javascript
// Before enrolling in unit:
1. Check prerequisites: GET /api/prerequisites/{unitId}/check
2. If prerequisites met, allow enrollment
3. Add schedule display to enrollment confirmation
```

#### Dashboard Integration

```javascript
// Add to student dashboard:
- Link to Timetable
- Link to Leave Requests
- Pending leave requests count

// Add to admin dashboard:
- Leave requests pending approval
- New schedules created
- Active prerequisites
```

#### Notifications

```javascript
// Already integrated email triggers at:
- Payment reminders
- Assignment deadlines
- Grade releases
// Ready to extend to:
- Class scheduling changes
- Leave request status updates
- Attendance alerts
```

---

## 🚀 11. How to Use

### 1. Update Login Page

Add "Forgot Password?" link:

```jsx
<a href="/request-password-reset">Forgot Password?</a>
```

### 2. Update Navigation

Add to student/lecturer navigation:

```jsx
<li><a href="/timetable">My Timetable</a></li>
<li><a href="/leave-requests">Leave Requests</a></li>
```

### 3. Add to Admin Dashboard

```jsx
<Card title="Pending Leaves" count={pendingLeaves} link="/admin/leave-requests" />
<Card title="Schedules Created" count={schedules} link="/admin/schedules" />
```

### 4. Update Unit Enrollment

```javascript
// In enrollment flow:
const prereqCheck = await checkPrerequisites(unitId);
if (!prereqCheck.met) {
  showError("You must complete: " + prereqCheck.unmetPrerequisites.join(", "));
  return;
}
```

---

## 📝 12. Testing Credentials

```
Admin: admin@kisitvet.local / Admin@12345
Student: student@kisitvet.local / Student@12345
Lecturer: lecturer@kisitvet.local / Lecturer@12345
```

---

## ⚠️ 13. Important Notes

### Email Delivery

- **Development**: May go to spam
- **Production**: Use professional email service
- **Testing**: Use email testing services like Mailtrap

### SMS Delivery

- Twilio: Works globally, paid service
- Africa's Talking: Kenya-specific, cheaper for local SMS
- Can switch providers by updating `smsService.js`

### Database

- All new migrations applied: `20260418172123_add_new_features`
- Indexes auto-created by Prisma for FK relationships
- Consider adding index for `PasswordResetToken.expiresAt` for cleanup

### Security

- Password reset tokens: 1-hour expiry
- Tokens hashed with SHA256 before storage
- Only `PENDING` leave requests can be cancelled
- All protected endpoints require JWT auth

---

## 📚 14. Next Phase Recommendations

1. **Immediate** (This week)
   - Configure email credentials
   - Test password reset flow
   - Add missing UI links

2. **Short-term** (Next 2 weeks)
   - Implement 2FA
   - Add leave request notifications
   - Create admin schedule management UI

3. **Medium-term** (Next month)
   - WebSockets for real-time chat
   - CSV bulk import
   - Advanced reporting

4. **Long-term** (Future)
   - AI chatbot
   - Mobile app
   - Cloud storage migration

---

## 📞 Support

For questions on implementation details, refer to:

- Backend: `/server/src/controllers/*.js`
- Frontend: `/client/src/pages/*.jsx`
- Database: `/server/prisma/schema.prisma`
- Routes: `/server/src/routes/*.js`

Last Updated: April 18, 2026
