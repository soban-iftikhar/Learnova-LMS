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

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/dashboard" element={<StudentDashboard />} />
                      <Route path="/courses" element={<StudentCourses />} />
                      <Route path="/course/:id" element={<CourseDetail />} />
                      <Route path="/quiz/:id" element={<Quiz />} />
                      <Route path="/profile" element={<StudentProfile />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
