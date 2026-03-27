import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function FinanceDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api
      .get('/admin/finance/summary')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">
        Finance Dashboard
      </h1>
      {!summary ? (
        <div className="text-sm text-slate-500">Loading revenue data...</div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-slate-500">
                Total Revenue
              </div>
              <div className="mt-2 text-2xl font-semibold">
                KES {summary.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-slate-500">
                Paying Students
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {summary.totalPayingStudents}
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-slate-500">
                Successful Payments
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {summary.totalSuccessfulPayments}
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Revenue by program
            </h2>
            <div className="overflow-auto rounded-xl bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Program
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Department
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">
                      Paying students
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.programBreakdown.length ? (
                    summary.programBreakdown.map((p) => (
                      <tr key={p.programId || p.programName}>
                        <td className="px-4 py-2">{p.programName}</td>
                        <td className="px-4 py-2">
                          {p.departmentName || '-'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {p.studentCount}
                        </td>
                        <td className="px-4 py-2 text-right">
                          KES {p.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-slate-500"
                        colSpan={4}
                      >
                        No payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Payments by student
            </h2>
            <div className="overflow-auto rounded-xl bg-white shadow-sm">
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
                    <th className="px-4 py-2 text-right font-medium text-slate-600">
                      Payments
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">
                      Total paid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.studentBreakdown.length ? (
                    summary.studentBreakdown.map((s) => (
                      <tr key={s.studentId}>
                        <td className="px-4 py-2">{s.admissionNumber}</td>
                        <td className="px-4 py-2">{s.fullName}</td>
                        <td className="px-4 py-2">{s.programName || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          {s.paymentsCount}
                        </td>
                        <td className="px-4 py-2 text-right">
                          KES {s.totalPaid.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-slate-500"
                        colSpan={5}
                      >
                        No payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

