import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

// Auth Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentCourses from './pages/student/Courses'
import CourseDetail from './pages/student/CourseDetail'
import QuizPage from './pages/student/QuizPage'

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherCourses from './pages/teacher/Courses'
import CreateCourse from './pages/teacher/CreateCourse'
import EditCourse from './pages/teacher/EditCourse'
import CourseAnalytics from './pages/teacher/CourseAnalytics'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminInstructors from './pages/admin/Instructors'
import AdminStudents from './pages/admin/Students'
import AdminCourses from './pages/admin/Courses'

// Common Pages
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Student Routes */}
            <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route path="/student/courses/:courseId" element={<CourseDetail />} />
            <Route path="/student/quiz/:quizId" element={<QuizPage />} />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/courses/create" element={<CreateCourse />} />
            <Route path="/teacher/courses/:courseId/edit" element={<EditCourse />} />
            <Route path="/teacher/courses/:courseId/analytics" element={<CourseAnalytics />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/instructors" element={<AdminInstructors />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
