import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data)).catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Admin Portal
        </h1>
        <p className="text-sm text-slate-600">
          Control center for students, academics, finance, reports, and users.
        </p>
      </div>

      {!stats ? (
        <div className="text-sm text-slate-500">Loading dashboard...</div>
      ) : (
        <>
          {/* Critical Dashboard */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Total Students
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.totalStudents}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Revenue (Fees Collected)
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  KES {stats.totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Pending Balances
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  -
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Pending balances need a student fee summary endpoint in admin scope.
                </div>
              </div>
            </div>
          </section>

          {/* Module Cards */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Modules (Actions)
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Student Management
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Add/edit students, assign programs, update status.
                </div>
                <div className="mt-3 text-sm text-slate-800">
                  <a className="underline" href="/dashboard/students">
                    Open students page
                  </a>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Academic Management
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Departments, programs, units/courses, semester setup.
                </div>
                <div className="mt-3 text-sm text-slate-800">
                  <a className="underline" href="/dashboard/academic">
                    Open academic page
                  </a>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Lecturer Management
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Add lecturers and assign units (coming soon in admin UI).
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Finance Module
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Fee structures, payments, M-Pesa integration, receipts.
                </div>
                <div className="mt-3 text-sm text-slate-800">
                  <a className="underline" href="/dashboard/finance">
                    Open finance page
                  </a>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Reports
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Student reports, academic performance, fee collection and attendance (coming soon).
                </div>
                <div className="mt-3 text-sm text-slate-800">
                  <a className="underline" href="/dashboard/reports">
                    Open reports page
                  </a>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Biometric Integration
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Sync fingerprint devices and attendance logs (coming soon).
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  User Management
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Create users (Admin, Lecturer, Student), assign roles, reset passwords (not fully implemented).
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Current backend supports registering users via the `auth/register` endpoint only for ADMIN.
                </div>
              </div>
            </div>
          </section>

          {/* Breakdown */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Enrollment Breakdown
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-slate-800">
                  Students per Department
                </h3>
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
                <h3 className="mb-2 text-sm font-semibold text-slate-800">
                  Students per Program
                </h3>
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
          </section>
        </>
      )}
    </div>
  );
}

