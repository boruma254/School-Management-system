import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">
        Admin Dashboard
      </h1>
      {!stats ? (
        <div className="text-sm text-slate-500">Loading statistics...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-slate-500">
                Total Students
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {stats.totalStudents}
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-slate-500">
                Total Revenue
              </div>
              <div className="mt-2 text-2xl font-semibold">
                KES {stats.totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-800">
                Students per Department
              </h2>
              <ul className="space-y-1 text-sm">
                {stats.studentsPerDepartment.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between border-b py-1 last:border-b-0"
                  >
                    <span>{d.name}</span>
                    <span className="font-medium">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-800">
                Students per Program
              </h2>
              <ul className="space-y-1 text-sm">
                {stats.studentsPerProgram.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border-b py-1 last:border-b-0"
                  >
                    <span>{p.name}</span>
                    <span className="font-medium">{p.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

