import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/academic/units')
      .then((res) => {
        if (!isMounted) return;
        setUnits(res.data.units || []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const dashboard = useMemo(() => {
    const totalUnits = units.length;
    return {
      totalUnits,
      todayClasses: 0, // Attendance/timetable scheduling not implemented in backend yet
    };
  }, [units.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Lecturer Portal
        </h1>
        <p className="text-sm text-slate-600">
          Welcome, {user?.fullName || 'Lecturer'}
        </p>
      </div>

      {/* Dashboard */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">
              Assigned Units
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? '-' : dashboard.totalUnits}
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">
              Number of Students
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              -
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">
              Today&apos;s Classes
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {dashboard.todayClasses}
            </div>
          </div>
        </div>
      </section>

      {/* Course Management */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Course Management
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-800">
              Assigned Units
            </div>
            {loading ? (
              <div className="text-sm text-slate-500">Loading units...</div>
            ) : units.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {units.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0"
                  >
                    <span className="font-medium">
                      {u.code} - {u.name}
                    </span>
                    <span className="text-slate-500">
                      Sem {u.semester}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-slate-500">
                No units found.
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-800">
              Upload Notes / Materials
            </div>
            <div className="text-sm text-slate-600">
              Notes upload is not implemented yet in the backend.
            </div>
            <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
              Add a file upload endpoint and storage integration to make this fully functional.
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">
            Manage Class Lists
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Class list management is a coming-soon feature (needs lecturer-unit assignments and enrollment listing).
          </div>
        </div>
      </section>

      {/* Grading */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Grading</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-slate-800">
              Enter CAT Marks
            </div>
            <div className="text-sm text-slate-600">
              This UI is currently a placeholder. When enrollment listing is available, you can enter CAT and Exam marks per student.
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-slate-800">
              Auto Grade Calculation
            </div>
            <div className="text-sm text-slate-600">
              Grade computation exists in backend for `POST /api/academic/grades`, but the frontend needs an enrollment picker to submit marks.
            </div>
          </div>
        </div>
      </section>

      {/* Attendance */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Attendance</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              Record Attendance
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Attendance recording (manual/biometric sync) is not implemented in the backend yet.
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              Attendance Reports
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Reports require attendance logs/models that are not present in the current backend.
            </div>
          </div>
        </div>
      </section>

      {/* Communication */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Communication
        </h2>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">
            Send Announcements to Students
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Student messaging/notifications are not modeled in the current backend yet.
          </div>
        </div>
      </section>
    </div>
  );
}

