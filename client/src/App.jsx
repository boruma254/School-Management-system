import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import StudentManagementPage from './pages/StudentManagementPage';
import AcademicManagementPage from './pages/AcademicManagementPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SignupPage from './pages/SignupPage';
import StudentDocumentsPage from './pages/StudentDocumentsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ResourcesPage from './pages/ResourcesPage';
import PublicationsPage from './pages/PublicationsPage';
import NewsletterPage from './pages/NewsletterPage';
import FaqPage from './pages/FaqPage';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/landing" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/dashboard/student" replace />;
  if (user.role === 'LECTURER') return <Navigate to="/dashboard/lecturer" replace />;
  if (user.role === 'FINANCE') return <Navigate to="/dashboard/finance" replace />;
  return <Navigate to="/landing" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Public Info Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/publications" element={<PublicationsPage />} />
      <Route path="/newsletter" element={<NewsletterPage />} />
      <Route path="/faq" element={<FaqPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootRedirect />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="documents"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="lecturer"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute allowedRoles={['FINANCE', 'ADMIN']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StudentManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="academic"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LECTURER']}>
              <AcademicManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

