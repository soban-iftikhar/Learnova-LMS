import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/common/Toast'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { PageLoader } from './components/common/Spinner'

// ─── Layouts ─────────────────────────────────────────────────────────────────
import AppLayout    from './components/layout/AppLayout'
import PublicLayout from './components/layout/PublicLayout'
import TeacherLayout from './components/layout/TeacherLayout'
import AdminLayout from './components/layout/AdminLayout'

// ─── Auth pages (eager — needed immediately) ─────────────────────────────────
import LoginPage  from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// ─── App pages (lazy — loaded on demand) ─────────────────────────────────────
const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const CoursesPage      = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const AssignmentsPage  = lazy(() => import('./pages/AssignmentsPage'))
const ProgressPage     = lazy(() => import('./pages/ProgressPage'))
const SettingsPage     = lazy(() => import('./pages/SettingsPage'))
const AboutPage        = lazy(() => import('./pages/AboutPage'))
const ContactPage      = lazy(() => import('./pages/ContactPage'))
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'))

// ─── Teacher pages ───────────────────────────────────────────────────────────
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'))
const TeacherCourses = lazy(() => import('./pages/teacher/Courses'))
const CreateCourse = lazy(() => import('./pages/teacher/CreateCourse'))
const EditCourse = lazy(() => import('./pages/teacher/EditCourse'))
const CourseAnalytics = lazy(() => import('./pages/teacher/CourseAnalytics'))

// ─── Admin pages ─────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminStudents = lazy(() => import('./pages/admin/Students'))
const AdminInstructors = lazy(() => import('./pages/admin/Instructors'))
const AdminCourses = lazy(() => import('./pages/admin/Courses'))

// ─── Placeholder stubs for future routes ────────────────────────────────────
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-xl font-bold text-ink mb-2">{title}</h2>
    <p className="text-gray-400 text-sm">This page is coming soon. Stay tuned!</p>
  </div>
)

// ─── App ────────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public / Marketing routes ───────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path="/about"   element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* ── Auth routes (redirect to dashboard if logged in) ─────── */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignupPage />
                </GuestRoute>
              }
            />

            {/* ── Protected student routes ─────────────────────────────── */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route path="/dashboard"  element={<DashboardPage />} />

              {/* Courses */}
              <Route path="/courses"     element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />

              {/* Assignments */}
              <Route path="/assignments" element={<AssignmentsPage />} />

              {/* Progress & Analytics */}
              <Route path="/progress"    element={<ProgressPage />} />

              {/* Calendar stub */}
              <Route path="/calendar"    element={<ComingSoon title="Calendar" />} />

              {/* Help stub */}
              <Route path="/help"        element={<ComingSoon title="Help Center" />} />

              {/* Profile / Settings */}
              <Route path="/profile"     element={<SettingsPage />} />
              <Route path="/settings"    element={<SettingsPage />} />
            </Route>

            {/* ── Instructor/Teacher routes ──────────────────────────── */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/courses" element={<TeacherCourses />} />
              <Route path="/teacher/courses/create" element={<CreateCourse />} />
              <Route path="/teacher/courses/:courseId/edit" element={<EditCourse />} />
              <Route path="/teacher/courses/:courseId/analytics" element={<CourseAnalytics />} />
            </Route>

            {/* ── Admin routes ───────────────────────────────────────── */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/instructors" element={<AdminInstructors />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
            </Route>

            {/* ── Root redirect ────────────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ── 404 ──────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
