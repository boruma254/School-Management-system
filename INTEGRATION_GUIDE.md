# Quick Integration Guide - New Features

## 1️⃣ Update App Router (App.jsx)

Add these new routes to your router:

```jsx
import RequestPasswordResetPage from './pages/RequestPasswordResetPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TimetablePage from './pages/TimetablePage';
import LeaveRequestPage from './pages/LeaveRequestPage';
import AdminLeaveManagementPage from './pages/AdminLeaveManagementPage';

// In your route definitions:
<Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
<Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
<Route path="/leave-requests" element={<ProtectedRoute><LeaveRequestPage /></ProtectedRoute>} />
<Route path="/admin/leave-requests" element={<ProtectedRoute><AdminLeaveManagementPage /></ProtectedRoute>} />
```

---

## 2️⃣ Update Login Page

Add "Forgot Password?" link:

```jsx
// In LoginPage.jsx
<div className="text-center mt-4">
  <a href="/request-password-reset" className="text-blue-600 hover:underline">
    Forgot Password?
  </a>
</div>
```

---

## 3️⃣ Update Student Dashboard Navigation

```jsx
// In StudentDashboard.jsx or navigation component
<nav>
  {/* Existing links */}
  <li>
    <a href="/timetable" className="hover:text-blue-600">
      📅 My Timetable
    </a>
  </li>
  <li>
    <a href="/leave-requests" className="hover:text-blue-600">
      🗂️ Leave Requests
    </a>
  </li>
</nav>
```

---

## 4️⃣ Update Admin Dashboard

```jsx
// In AdminDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const [pendingLeaves, setPendingLeaves] = useState(0);

useEffect(() => {
  fetchPendingLeaves();
}, []);

const fetchPendingLeaves = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/leave-requests?status=PENDING`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    setPendingLeaves(response.data.leaveRequests?.length || 0);
  } catch (error) {
    console.error("Error fetching pending leaves:", error);
  }
};

// In dashboard JSX:
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <Card
    title="Pending Leave Requests"
    value={pendingLeaves}
    link="/admin/leave-requests"
    className="bg-yellow-100"
  />
  {/* Other cards */}
</div>;
```

---

## 5️⃣ Integrate Prerequisites into Enrollment

```jsx
// In unit enrollment flow
import axios from "axios";

const checkAndEnroll = async (unitId) => {
  try {
    // Check prerequisites
    const prereqResponse = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/prerequisites/${unitId}/check`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );

    if (!prereqResponse.data.met) {
      const unmet = prereqResponse.data.unmetPrerequisites.join(", ");
      alert(`You must complete these units first: ${unmet}`);
      return;
    }

    // Proceed with enrollment
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/academic/enroll`,
      { unitId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );

    alert("Successfully enrolled!");
  } catch (error) {
    alert(error.response?.data?.error || "Error enrolling in unit");
  }
};
```

---

## 6️⃣ Add Schedule Display to Unit Details

```jsx
// In unit details component
const [schedules, setSchedules] = useState([]);

useEffect(() => {
  fetchSchedules();
}, [unitId]);

const fetchSchedules = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/schedules/unit/${unitId}`,
    );
    setSchedules(response.data.schedules || []);
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
};

// In JSX:
{
  schedules.length > 0 && (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">Class Schedule</h3>
      <div className="space-y-2">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-blue-50 p-3 rounded">
            <p className="font-semibold">{schedule.dayOfWeek}</p>
            <p className="text-sm">
              {schedule.startTime} - {schedule.endTime}
              {schedule.room && ` • Room ${schedule.room}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7️⃣ Create Utility Hook for API Calls

```jsx
// hooks/useApi.js
import axios from "axios";

export const useApi = () => {
  const getToken = () => localStorage.getItem("token");

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return api;
};

// Usage:
const api = useApi();
const response = await api.get("/leave-requests/my/requests");
```

---

## 8️⃣ Configure Environment Variables

Update your `.env` file in the root directory:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@tvet-erp.local
FRONTEND_URL=http://localhost:5173

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Database (already set)
DATABASE_URL="postgresql://tvet_user:tvet_password@localhost:5433/tvet_erp"
```

---

## 9️⃣ Create Lecturer Schedule Page (Optional)

```jsx
// pages/LecturerSchedulePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LecturerSchedulePage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/schedules/lecturer/timetable`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setSchedules(response.data.schedules);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchSchedules();
  }, []);

  return (
    // Similar to TimetablePage but shows lecturer's assigned classes
  );
}
```

---

## 🔟 Testing Checklist

Before going live:

- [ ] Test password reset email delivery
- [ ] Test timetable view (no classes scenario)
- [ ] Test leave request submission
- [ ] Test leave request approval as admin
- [ ] Test prerequisites blocking enrollment
- [ ] Verify prerequisites check prevents unqualified students
- [ ] Test schedule display in unit details
- [ ] Verify SMS notifications (if configured)
- [ ] Test all new routes require proper authentication
- [ ] Verify RBAC is enforced (admin-only operations)

---

## 🐛 Troubleshooting

### Email not sending?

- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- For Gmail: Use app password, not regular password
- Check spam folder
- Enable "Less secure apps" if using Gmail

### SMS not sending?

- Verify Twilio credentials are correct
- Check phone number format (include country code)
- Ensure account has credits

### Routes not working?

- Make sure you've updated `/server/src/routes/index.js`
- Restart backend server
- Check browser console for 404 errors

### Database errors?

- Run: `npx prisma migrate dev`
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running

---

## 📞 Need Help?

Refer to:

- NEW_FEATURES_GUIDE.md - Detailed feature documentation
- /server/src/controllers/\*.js - Backend logic
- /client/src/pages/\*.jsx - Frontend implementation

Created: April 18, 2026
Last Updated: April 18, 2026
