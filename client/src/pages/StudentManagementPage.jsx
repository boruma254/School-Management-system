import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentLoading, setSelectedStudentLoading] = useState(false);
  const [pending, setPending] = useState([]);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [message, setMessage] = useState('');
  const [edits, setEdits] = useState({});

  useEffect(() => {
    let isMounted = true;
    api
      .get('/students')
      .then((res) => {
        if (!isMounted) return;
        setStudents(res.data.students || []);
      })
      .catch((err) => console.error(err));

    api
      .get('/admin/students/pending')
      .then((res) => {
        if (!isMounted) return;
        setPending(res.data.pending || []);
      })
      .catch((err) => console.error(err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async () => {
    setMessage('');
    try {
      await api.post('/admin/students/approve', { admissionNumber });
      setMessage('Student approved successfully.');
      setAdmissionNumber('');

      const res = await api.get('/admin/students/pending');
      setPending(res.data.pending || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Approval failed.');
    }
  };

  const reload = async () => {
    const res = await api.get('/students');
    setStudents(res.data.students || []);
    const pr = await api.get('/admin/students/pending');
    setPending(pr.data.pending || []);
  };

  const handleUpdate = async (studentId) => {
    setMessage('');
    try {
      const payload = edits[studentId] || {};
      await api.put(`/students/${studentId}`, {
        status: payload.status,
        currentSemester: payload.currentSemester,
      });
      setMessage('Student updated.');
      await reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleDelete = async (studentId) => {
    setMessage('');
    if (!window.confirm('Delete this student permanently?')) return;
    try {
      await api.delete(`/students/${studentId}`);
      setMessage('Student deleted.');
      await reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleView = async (studentId) => {
    setSelectedStudent(null);
    setSelectedStudentLoading(true);
    try {
      const res = await api.get(`/students/${studentId}`);
      setSelectedStudent(res.data.student);
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedStudentLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (s.user?.fullName || '').toLowerCase();
    const admission = (s.admissionNumber || '').toLowerCase();
    return name.includes(q) || admission.includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          Student Management
        </h1>
        <p className="text-sm text-slate-600">
          Admin can approve student signup requests by admission number.
        </p>
      </div>

      {/* Pending approvals */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
        {message && (
          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Admission Number
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="e.g. ADM-1001"
            />
          </div>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!admissionNumber.trim()}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 md:w-auto"
          >
            Approve
          </button>
        </div>

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
                  Requested Semester
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pending.length ? (
                pending.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2">{s.admissionNumber}</td>
                    <td className="px-4 py-2">{s.user?.fullName}</td>
                    <td className="px-4 py-2">{s.program?.name}</td>
                    <td className="px-4 py-2">{s.currentSemester}</td>
                    <td className="px-4 py-2">{s.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>
                    No pending approvals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* All students */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Search students
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Search by name or admission number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

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
              <th className="px-4 py-2 text-left font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">{s.admissionNumber}</td>
                <td className="px-4 py-2">{s.user?.fullName}</td>
                <td className="px-4 py-2">{s.program?.name}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    value={
                      edits[s.id]?.currentSemester ?? s.currentSemester ?? ''
                    }
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        [s.id]: {
                          ...(prev[s.id] || {}),
                          currentSemester:
                            e.target.value === ''
                              ? ''
                              : Number(e.target.value),
                        },
                      }))
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    value={edits[s.id]?.status ?? s.status}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        [s.id]: {
                          ...(prev[s.id] || {}),
                          status: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(s.id)}
                      className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleView(s.id)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Spreadsheet-style overview */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b px-4 py-2 text-sm font-semibold text-slate-800">
          Spreadsheet view (all students)
        </div>
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Admission
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Email
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Program
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Department
                </th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">
                  Semester
                </th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">
                  Units
                </th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">
                  Payments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => {
                const unitsCount = s.enrollments ? s.enrollments.length : 0;
                const totalPaid = (s.payments || []).reduce(
                  (sum, p) => sum + (p.amount || 0),
                  0
                );
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">{s.admissionNumber}</td>
                    <td className="px-3 py-2">{s.user?.fullName}</td>
                    <td className="px-3 py-2">{s.user?.email}</td>
                    <td className="px-3 py-2">{s.program?.name}</td>
                    <td className="px-3 py-2">
                      {s.department?.name || '-'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {s.currentSemester}
                    </td>
                    <td className="px-3 py-2 text-right">{unitsCount}</td>
                    <td className="px-3 py-2 text-right">
                      KES {totalPaid.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student detail drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/20 p-4">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedStudent.user?.fullName} ({selectedStudent.admissionNumber})
              </h2>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {selectedStudentLoading ? (
              <div className="text-sm text-slate-500">Loading details...</div>
            ) : (
              <div className="space-y-4 text-sm">
                <section className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">
                      Profile
                    </h3>
                    <dl className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Email</dt>
                        <dd>{selectedStudent.user?.email}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Phone</dt>
                        <dd>{selectedStudent.user?.phoneNumber || '-'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Status</dt>
                        <dd>{selectedStudent.status}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">
                      Academic
                    </h3>
                    <dl className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Program</dt>
                        <dd>{selectedStudent.program?.name}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Department</dt>
                        <dd>{selectedStudent.department?.name || '-'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Current semester</dt>
                        <dd>{selectedStudent.currentSemester}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-semibold text-slate-800">
                    Units & Grades
                  </h3>
                  <div className="overflow-hidden rounded-md border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Code
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Unit
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">
                            CAT
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">
                            Exam
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">
                            Total
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudent.enrollments?.length ? (
                          selectedStudent.enrollments.map((e) => (
                            <tr key={e.id}>
                              <td className="px-3 py-2">{e.unit?.code}</td>
                              <td className="px-3 py-2">{e.unit?.name}</td>
                              <td className="px-3 py-2 text-right">
                                {e.grade?.catScore ?? '-'}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {e.grade?.examScore ?? '-'}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {e.grade?.totalScore ?? '-'}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {e.grade?.grade ?? '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-3 py-4 text-center text-slate-500"
                              colSpan={6}
                            >
                              No units or grades recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-semibold text-slate-800">
                    Payments
                  </h3>
                  <div className="overflow-hidden rounded-md border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Method
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">
                            Ref
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">
                            Amount
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudent.payments?.length ? (
                          selectedStudent.payments.map((p) => (
                            <tr key={p.id}>
                              <td className="px-3 py-2">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2">{p.method}</td>
                              <td className="px-3 py-2">{p.transactionRef}</td>
                              <td className="px-3 py-2 text-right">
                                KES {p.amount.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-right">{p.status}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-3 py-4 text-center text-slate-500"
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
        </div>
      )}
    </div>
  );
}

