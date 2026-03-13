import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentService, courseService } from '../services/api';
import { BookOpen, CheckCircle, BarChart3, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEnrollments();
  }, [user?.id]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const response = await studentService.getEnrollments(user?.id);
      const enrollmentData = response.data;
      
      setEnrollments(enrollmentData.slice(0, 6)); // Show 6 recent
      
      // Calculate stats
      setStats({
        totalEnrolled: enrollmentData.length,
        completed: enrollmentData.filter(e => e.status === 'COMPLETED').length,
        inProgress: enrollmentData.filter(e => e.status === 'ACTIVE').length,
      });
    } catch (err) {
      setError('Failed to load enrollments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600">Your learning dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Courses Enrolled</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalEnrolled}
                </p>
              </div>
              <BookOpen size={40} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.inProgress}
                </p>
              </div>
              <Clock size={40} className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle size={40} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Recent Courses */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              My Courses
            </h2>
            <Link
              to="/courses"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No courses enrolled yet</p>
              <Link
                to="/courses"
                className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {enrollment.course?.title || 'Course'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        enrollment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {enrollment.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {enrollment.course?.description?.substring(0, 100) || 'N/A'}...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: enrollment.status === 'COMPLETED' ? '100%' : '45%',
                      }}
                    />
                  </div>
                  <Link
                    to={`/course/${enrollment.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Continue Learning →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/courses"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <BookOpen className="mx-auto mb-2" size={32} />
            <h3 className="font-bold text-lg">Explore Courses</h3>
            <p className="text-blue-100 text-sm">Find new courses to enroll</p>
          </Link>

          <Link
            to="/profile"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <BarChart3 className="mx-auto mb-2" size={32} />
            <h3 className="font-bold text-lg">My Performance</h3>
            <p className="text-purple-100 text-sm">View your achievements</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
