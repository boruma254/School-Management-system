import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AcademicManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentOverview, setDepartmentOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  useEffect(() => {
    api
      .get('/academic/departments')
      .then((res) => setDepartments(res.data.departments || []));
    api
      .get('/academic/programs')
      .then((res) => setPrograms(res.data.programs || []));
    api.get('/academic/units').then((res) => setUnits(res.data.units || []));
  }, []);

  const openDepartment = async (dept) => {
    setSelectedDepartment(dept);
    setDepartmentOverview(null);
    setLoadingOverview(true);
    try {
      const res = await api.get(`/academic/departments/${dept.id}/overview`);
      setDepartmentOverview(res.data.overview);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOverview(false);
    }
  };

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
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => openDepartment(d)}
                  className="w-full rounded-md px-2 py-1 text-left text-slate-800 hover:bg-slate-100" 
                >
                  {d.name}   
                  {d.students?.length != null && (
                    <span className="ml-2 text-xs text-slate-500">
                      ({d.students.length} students)
                    </span>
                  )}
                </button>

                
              </li>
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

      {selectedDepartment && (
        <div className="overflow-hidden rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedDepartment.name}
              </h2>
              <p className="text-xs text-slate-500">
                Department overview – students, units, lecturers & attendance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDepartment(null);
                setDepartmentOverview(null);
              }}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          {loadingOverview || !departmentOverview ? (
            <div className="text-sm text-slate-500">Loading department data...</div>
          ) : (
            <div className="space-y-6 text-sm">
              <section className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Students
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    {departmentOverview.totalStudents}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Programs
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    {departmentOverview.totalPrograms}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Units
                  </div>
                  <div className="mt1 text-xl font-semibold text-slate-900">
                    {departmentOverview.totalUnits}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">
                  Lecturers
                </h3>
                {departmentOverview.lecturers.length ? (
                  <ul className="space-y-1">
                    {departmentOverview.lecturers.map((l) => (
                      <li key={l.id} className="flex items-center justify-between">
                        <span>{l.fullName}</span>
                        <span className="text-xs text-slate-500">
                          {l.email}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-500">
                    No lecturers assigned to this department yet.
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">
                  Students & attendance
                </h3>
                <div className="overflow-auto rounded-md border border-slate-200">
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
                          Program
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-slate-600">
                          Units
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-slate-600">
                          Classes attended
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departmentOverview.students.length ? (
                        departmentOverview.students.map((s) => (
                          <tr key={s.id}>
                            <td className="px-3 py-2">
                              {s.admissionNumber}
                            </td>
                            <td className="px-3 py-2">{s.fullName}</td>
                            <td className="px-3 py-2">
                              {s.program?.name || '-'}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {s.unitsRegistered}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {s.classesAttended}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            className="px-3 py-4 text-center text-slate-500"
                            colSpan={5}
                          >
                            No students in this department yet.
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
      )}
    </div>
  );
}

