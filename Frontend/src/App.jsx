import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/common/Toast'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { PageLoader } from './components/common/Spinner'

import AppLayout     from './components/layout/AppLayout'
import PublicLayout  from './components/layout/PublicLayout'
import TeacherLayout from './components/layout/TeacherLayout'
import AdminLayout   from './components/layout/AdminLayout'

import LoginPage     from './pages/LoginPage'
import SignupPage    from './pages/SignupPage'
import StudentSignup from './pages/StudentSignup'
import TeacherSignup from './pages/TeacherSignup'

// Student
const StudentDashboard  = lazy(() => import('./pages/student/Dashboard'))
const CoursesPage       = lazy(() => import('./pages/student/Courses'))
const BrowseCoursesPage = lazy(() => import('./pages/student/BrowseCourses'))
const CourseDetailPage  = lazy(() => import('./pages/student/CourseDetail'))
const AssignmentsPage   = lazy(() => import('./pages/student/Assignments'))
const ProgressPage      = lazy(() => import('./pages/student/Progress'))
const SettingsPage      = lazy(() => import('./pages/student/Settings'))

// Teacher
const TeacherDashboard   = lazy(() => import('./pages/teacher/Dashboard'))
const TeacherCourses     = lazy(() => import('./pages/teacher/Courses'))
const CreateCourse       = lazy(() => import('./pages/teacher/CreateCourse'))
const EditCourse         = lazy(() => import('./pages/teacher/EditCourse'))
const CourseBuilder      = lazy(() => import('./pages/teacher/CourseBuilder'))
const CourseAnalytics    = lazy(() => import('./pages/teacher/CourseAnalytics'))
const TeacherQuizzes     = lazy(() => import('./pages/teacher/Quizzes'))
const TeacherChat        = lazy(() => import('./pages/teacher/Chat'))
const TeacherAssignments = lazy(() => import('./pages/teacher/Assignments'))
const TeacherAttendance  = lazy(() => import('./pages/teacher/Attendance'))
const TeacherSettings    = lazy(() => import('./pages/teacher/Settings'))

// Admin
const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard'))
const AdminStudents    = lazy(() => import('./pages/admin/Students'))
const AdminInstructors = lazy(() => import('./pages/admin/Instructors'))
const AdminCourses     = lazy(() => import('./pages/admin/Courses'))

// Public
const AboutPage     = lazy(() => import('./pages/AboutPage'))
const ContactPage   = lazy(() => import('./pages/ContactPage'))
const NotFoundPage  = lazy(() => import('./pages/NotFoundPage'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/about"   element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup"         element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="/signup/student" element={<GuestRoute><StudentSignup /></GuestRoute>} />
            <Route path="/signup/teacher" element={<GuestRoute><TeacherSignup /></GuestRoute>} />
            <Route path="/oauth-callback" element={<OAuthCallback />} />

            {/* Student */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard"         element={<StudentDashboard />} />
              <Route path="/courses"           element={<CoursesPage />} />
              <Route path="/browse"            element={<BrowseCoursesPage />} />
              <Route path="/courses/:id"       element={<CourseDetailPage />} />
              <Route path="/assignments"       element={<AssignmentsPage />} />
              <Route path="/progress"          element={<ProgressPage />} />
              <Route path="/settings"          element={<SettingsPage />} />
              <Route path="/profile"           element={<SettingsPage />} />
            </Route>

            {/* Instructor */}
            <Route element={<ProtectedRoute allowedRoles={['INSTRUCTOR']}><TeacherLayout /></ProtectedRoute>}>
              <Route path="/teacher/dashboard"                   element={<TeacherDashboard />} />
              <Route path="/teacher/courses"                     element={<TeacherCourses />} />
              <Route path="/teacher/courses/create"              element={<CreateCourse />} />
              <Route path="/teacher/courses/:courseId/edit"      element={<EditCourse />} />
              <Route path="/teacher/courses/:courseId/build"     element={<CourseBuilder />} />
              <Route path="/teacher/courses/:courseId/analytics" element={<CourseAnalytics />} />
              <Route path="/teacher/quizzes"                    element={<TeacherQuizzes />} />
              <Route path="/teacher/chat"                       element={<TeacherChat />} />
              <Route path="/teacher/assignments"                 element={<TeacherAssignments />} />
              <Route path="/teacher/attendance"                  element={<TeacherAttendance />} />
              <Route path="/teacher/settings"                    element={<TeacherSettings />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard"   element={<AdminDashboard />} />
              <Route path="/admin/students"    element={<AdminStudents />} />
              <Route path="/admin/instructors" element={<AdminInstructors />} />
              <Route path="/admin/courses"     element={<AdminCourses />} />
              <Route path="/admin/settings"    element={<SettingsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
