import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function StudentProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [admissionNumber, setAdmissionNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [programName, setProgramName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [currentSemester, setCurrentSemester] = useState('');

  // Editable fields (self-service)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    setLoading(true);
    setError('');

    api
      .get('/students/me')
      .then((res) => {
        if (!isMounted) return;
        const s = res.data.student;
        setAdmissionNumber(s.admissionNumber || '');
        setFullName(s.user?.fullName || user.fullName || '');
        setProgramName(s.program?.name || '');
        setDepartmentName(s.department?.name || '');
        setCurrentSemester(s.currentSemester ?? '');

        setPhoneNumber(s.user?.phoneNumber || '');
        setEmail(s.user?.email || '');
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Failed to load profile.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    try {
      await api.put('/students/me/profile', {
        phoneNumber: phoneNumber || null,
        email: email || null,
        password: password || undefined,
      });

      // Keep it simple: clear password; reload for updated email/phone.
      setPassword('');

      const res = await api.get('/students/me');
      const s = res.data.student;
      setPhoneNumber(s.user?.phoneNumber || '');
      setEmail(s.user?.email || '');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Update failed.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-600">
          Official details are locked after admission. You can update contact info and password.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading profile...</div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Locked Official Data */}
            <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Locked Official Data (Admin-controlled)</h2>
              <div className="text-xs text-slate-500">
                To update these fields, contact administration.
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-medium text-slate-500">Admission Number</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{admissionNumber || '-'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Full Legal Name</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{fullName || '-'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Program / Department</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {programName || '-'} {departmentName ? `(${departmentName})` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Current Semester</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{currentSemester ?? '-'}</div>
                </div>
              </div>
            </section>

            {/* Self-service editable fields */}
            <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Self-service (Student-controlled)</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Personal Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="e.g. 0712345678"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Personal Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </section>
          </form>
        </>
      )}
    </div>
  );
}

