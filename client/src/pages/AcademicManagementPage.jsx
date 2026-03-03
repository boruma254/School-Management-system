import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AcademicManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    api
      .get('/academic/departments')
      .then((res) => setDepartments(res.data.departments || []));
    api
      .get('/academic/programs')
      .then((res) => setPrograms(res.data.programs || []));
    api.get('/academic/units').then((res) => setUnits(res.data.units || []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Academic Management
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">
            Departments
          </h2>
          <ul className="space-y-1 text-sm">
            {departments.map((d) => (
              <li key={d.id}>{d.name}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">
            Programs
          </h2>
          <ul className="space-y-1 text-sm">
            {programs.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Units</h2>
          <ul className="space-y-1 text-sm">
            {units.map((u) => (
              <li key={u.id}>
                {u.code} - {u.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

