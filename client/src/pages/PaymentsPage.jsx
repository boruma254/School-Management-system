import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    api
      .get('/students/me')
      .then((res) => {
        const me = res.data.student;
        setStudent(me);
        return api.get(`/finance/students/${me.id}/payments`);
      })
      .then((r) => setPayments(r.data.payments || []))
      .catch((err) => console.error(err));
  }, [user]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!student) return;
    setMessage('');
    try {
      await api.post('/finance/mpesa/stk-push', {
        studentId: student.id,
        amount: Number(amount),
        phoneNumber: phone,
      });
      setMessage('STK push initiated. Check your phone to complete payment.');
      setAmount('');
    } catch (err) {
      setMessage(
        err.response?.data?.message || 'Failed to initiate payment.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
      {student && (
        <form
          onSubmit={handlePay}
          className="space-y-3 rounded-xl bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Amount (KES)
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Phone Number (2547...)
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Pay with M-Pesa
              </button>
            </div>
          </div>
          {message && (
            <div className="text-xs text-slate-600">
              <span>{message}</span>
            </div>
          )}
        </form>
      )}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">
          Payment History
        </h2>
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
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  KES {Number(p.amount).toLocaleString()}
                </td>
                <td className="px-4 py-2">{p.method}</td>
                <td className="px-4 py-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

