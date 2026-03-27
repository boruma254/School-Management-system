import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function gradeToPoints(letter) {
  if (!letter) return 0;
  const g = String(letter).toUpperCase();
  if (g === 'A') return 4;
  if (g === 'B') return 3;
  if (g === 'C') return 2;
  if (g === 'D') return 1;
  return 0;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get('/students/me'),
      api.get('/finance/students/me/fee-summary'),
    ])
      .then(([studentRes, feeRes]) => {
        if (!isMounted) return;
        const me = studentRes.data.student;
        setStudent(me);
        setFeeSummary(feeRes.data.summary);
        setPayments(me?.payments || []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const enrollments = student?.enrollments || [];

  const gpa = useMemo(() => {
    const graded = enrollments
      .map((e) => e.grade)
      .filter((g) => g && g.grade);

    if (!graded.length) return null;

    const totalPoints = graded.reduce(
      (sum, g) => sum + gradeToPoints(g.grade),
      0
    );
    return totalPoints / graded.length;
  }, [enrollments]);

  const quickStats = useMemo(() => {
    const unitsRegistered = enrollments.length;
    const attendancePercent = 92; // Backend biometric attendance not implemented yet (placeholder)
    const semester = student?.currentSemester;

    return { unitsRegistered, attendancePercent, semester };
  }, [enrollments.length, student?.currentSemester]);

  const results = useMemo(() => {
    return enrollments.map((e) => {
      const g = e.grade;
      return {
        enrollmentId: e.id,
        unitCode: e.unit?.code,
        unitName: e.unit?.name,
        semester: e.semester,
        gradeLetter: g?.grade,
        catScore: g?.catScore,
        examScore: g?.examScore,
        totalScore: g?.totalScore,
      };
    });
  }, [enrollments]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Student Portal
        </h1>
        <p className="text-sm text-slate-600">
          Welcome, {user?.fullName || 'Student'}
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading your profile...</div>
      ) : (
        <>
          {/* Dashboard */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Admission Number
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {student?.admissionNumber || '-'}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Current Semester
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {quickStats.semester || '-'}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Fee Balance
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  KES {Number(feeSummary?.feeBalance || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Units Registered
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {quickStats.unitsRegistered}
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  Attendance %
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {quickStats.attendancePercent}%
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-xs uppercase text-slate-500">
                  GPA / Results Summary
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {gpa === null ? '-' : gpa.toFixed(2)}
                </div>
              </div>
            </div>
          </section>

          {/* Academic Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Academic</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Enrolled Units
                </div>
                {results.length ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {results.map((r) => (
                      <li
                        key={r.enrollmentId}
                        className="flex items-center justify-between border-b pb-2 last:border-b-0"
                      >
                        <span className="font-medium">
                          {r.unitCode} - {r.unitName}
                        </span>
                        <span className="text-slate-500">
                          Sem {r.semester}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-500">
                    No units enrolled yet.
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Class Timetable
                </div>
                <div className="text-sm text-slate-600">
                  Timetable/timeslot data not implemented in the backend yet.
                </div>
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                  For now, this area shows a placeholder to match the UI.
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">
                Lecturer Assigned / Notes
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Unit-to-lecturer assignment and notes download are not modeled in the current backend.
              </div>
            </div>
          </section>

          {/* Results & Grades */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Results & Grades
                </h2>
                <p className="text-sm text-slate-600">
                  CAT + Exam results, final grades, and GPA summary.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-60"
              >
                Download Transcript (PDF)
              </button>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Unit
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      CAT
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Exam
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Total
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Final Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.length ? (
                    results.map((r) => (
                      <tr key={r.enrollmentId}>
                        <td className="px-4 py-2">
                          <div className="font-medium text-slate-900">
                            {r.unitCode}
                          </div>
                          <div className="text-xs text-slate-500">{r.unitName}</div>
                        </td>
                        <td className="px-4 py-2">
                          {r.catScore === undefined ? '-' : r.catScore}
                        </td>
                        <td className="px-4 py-2">
                          {r.examScore === undefined ? '-' : r.examScore}
                        </td>
                        <td className="px-4 py-2">
                          {r.totalScore === undefined ? '-' : r.totalScore}
                        </td>
                        <td className="px-4 py-2 font-semibold">
                          {r.gradeLetter || 'Pending'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>
                        No results yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Fees & Payments */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Fees & Payments
                </h2>
                <p className="text-sm text-slate-600">
                  Fee structure, balance, payment history, and M-Pesa (STK Push).
                </p>
              </div>
              <a
                href="/payments"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Pay via M-Pesa
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Fee Structure (Current Semester)
                </div>
                {feeSummary?.feeStructures?.length ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {feeSummary.feeStructures.map((fs) => (
                      <li
                        key={`${fs.id}`}
                        className="flex items-center justify-between border-b pb-2 last:border-b-0"
                      >
                        <span className="font-medium">
                          {fs.program?.name || 'Program'}
                        </span>
                        <span className="text-slate-500">
                          KES {Number(fs.amount).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-500">
                    No fee structure found for your program/semester.
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Summary
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Fee Total</span>
                    <span className="font-semibold">
                      KES {Number(feeSummary?.feeTotal || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Paid</span>
                    <span className="font-semibold">
                      KES {Number(feeSummary?.paidTotal || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span>Balance</span>
                    <span className="font-semibold">
                      KES {Number(feeSummary?.feeBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                  Receipt downloads are available from the backend once M-Pesa payments are initiated.
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="px-4 py-3 text-sm font-semibold text-slate-800">
                Payment History
              </div>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Method
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments?.length ? (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2">
                          {p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2">
                          KES {Number(p.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{p.method}</td>
                        <td className="px-4 py-2">{p.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-500"
                        colSpan={4}
                      >
                        No payments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Attendance */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Attendance</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-800">
                  Biometric Attendance
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Biometric sync and attendance logs are not implemented in the backend yet.
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-800">
                  Missed Classes Alerts
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Attendance-based alerts will appear once attendance data is connected.
                </div>
              </div>
            </div>
          </section>

          {/* Announcements */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">
                School Notices / Department Updates
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Announcement feeds are not modeled in the current backend.
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">
                Download Admission & Important Documents
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Documents become available after admin approval.
              </div>
              <div className="mt-3">
                <a
                  href="/documents"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Open Documents Page
                </a>
              </div>
            </div>
          </section>

          {/* Profile */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-800">
                  Personal Details
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Full Name</span>
                    <span className="font-medium">{user?.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admission</span>
                    <span className="font-medium">{student?.admissionNumber}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-800">
                  Course / Program
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Program</span>
                    <span className="font-medium">{student?.program?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Department</span>
                    <span className="font-medium">{student?.department?.name || '-'}</span>
                  </div>
                </div>
                <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                  For contact updates (phone/email) and password changes, open{' '}
                  <a
                    className="font-medium text-slate-900 underline"
                    href="/profile"
                  >
                    My Profile
                  </a>
                  .
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

