import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .get('/students/me')
      .then((res) => setStudent(res.data.student))
      .catch((err) => console.error(err));
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">
        Student Dashboard
      </h1>
      {!student ? (
        <div className="text-sm text-slate-500">Loading your profile...</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">Admission Number</div>
            <div className="text-lg font-semibold">
              {student.admissionNumber}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Program</div>
              <div className="text-lg font-semibold">
                {student.program?.name}
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Current Semester</div>
              <div className="text-lg font-semibold">
                {student.currentSemester}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

