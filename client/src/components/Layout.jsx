import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItemsByRole = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/students', label: 'Students' },
    { to: '/academic', label: 'Academic' },
    { to: '/finance', label: 'Finance' },
    { to: '/reports', label: 'Reports' },
  ],
  LECTURER: [
    { to: '/lecturer', label: 'Dashboard' },
    { to: '/academic', label: 'Academic' },
  ],
  STUDENT: [
    { to: '/student', label: 'Dashboard' },
    { to: '/payments', label: 'Payments' },
  ],
  FINANCE: [
    { to: '/finance', label: 'Dashboard' },
    { to: '/reports', label: 'Reports' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();

  const items = user ? navItemsByRole[user.role] || [] : [];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="hidden w-64 flex-shrink-0 bg-slate-900 text-slate-100 md:block">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="font-semibold tracking-tight">
              TVET ERP
            </Link>
          </div>
          <nav className="mt-4 space-y-1 px-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b bg-white px-4">
            <div className="md:hidden">
              <Link to="/" className="font-semibold text-slate-900">
                TVET ERP
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <div className="text-sm text-slate-600">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs uppercase">{user.role}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </header>
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

