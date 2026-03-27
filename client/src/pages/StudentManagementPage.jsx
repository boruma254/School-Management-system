import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
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
            {students.map((s) => (
              <tr key={s.id}>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

