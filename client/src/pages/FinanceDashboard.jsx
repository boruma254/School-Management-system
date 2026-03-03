import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function FinanceDashboard() {
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
        Finance Dashboard
      </h1>
      {!stats ? (
        <div className="text-sm text-slate-500">Loading revenue data...</div>
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-xs uppercase text-slate-500">
            Total Revenue
          </div>
          <div className="mt-2 text-2xl font-semibold">
            KES {stats.totalRevenue.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

