import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourses from './pages/StudentCourses';
import CourseDetail from './pages/CourseDetail';
import Quiz from './pages/Quiz';
import StudentProfile from './pages/StudentProfile';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <StudentDashboard />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <StudentCourses />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <CourseDetail />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Quiz />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <StudentProfile />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <LayoutWrapper>
                <About />
              </LayoutWrapper>
            }
          />
          <Route
            path="/contact"
            element={
              <LayoutWrapper>
                <Contact />
              </LayoutWrapper>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Layout wrapper component
function LayoutWrapper({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default App;
