import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api
      .get('/students')
      .then((res) => setStudents(res.data.students || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">
        Student Management
      </h1>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">
                Admission
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">
                Name
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">
                Program
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">
                Semester
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2">{s.admissionNumber}</td>
                <td className="px-4 py-2">{s.user?.fullName}</td>
                <td className="px-4 py-2">{s.program?.name}</td>
                <td className="px-4 py-2">{s.currentSemester}</td>
                <td className="px-4 py-2">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

