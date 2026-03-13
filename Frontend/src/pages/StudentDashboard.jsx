import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentService, courseService } from '../services/api';
import { BookOpen, CheckCircle, BarChart3, Clock, Zap, TrendingUp } from 'lucide-react';

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
      
      setEnrollments(enrollmentData.slice(0, 6));
      
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

  const getInitials = (email) => {
    return email?.split('@')[0].substring(0, 2).toUpperCase() || 'ST';
  };

  const getProgressColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'from-green-500 to-green-600';
      case 'ACTIVE': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'ACTIVE': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg`}>
              {getInitials(user?.email)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                Welcome back, {user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-gray-600">Keep learning, keep growing</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 - Total Enrolled */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Courses Enrolled</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {stats.totalEnrolled}
                </p>
                <p className="text-xs text-gray-500 mt-2">Total courses</p>
              </div>
              <div className="bg-blue-100 rounded-full p-4">
                <BookOpen size={32} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 2 - In Progress */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                  {stats.inProgress}
                </p>
                <p className="text-xs text-gray-500 mt-2">Active courses</p>
              </div>
              <div className="bg-amber-100 rounded-full p-4">
                <Clock size={32} className="text-amber-600" />
              </div>
            </div>
          </div>

          {/* Card 3 - Completed */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {stats.completed}
                </p>
                <p className="text-xs text-gray-500 mt-2">Finished courses</p>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <div className="text-red-600 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* My Courses Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">My Courses</h2>
              <p className="text-gray-600 text-sm">Continue your learning journey</p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block">
                <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium mb-4">No courses enrolled yet</p>
              <Link
                to="/courses"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all transform hover:scale-105"
                >
                  {/* Card Header with gradient overlay */}
                  <div className={`h-32 bg-gradient-to-br ${getProgressColor(enrollment.status)} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10 bg-white"></div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 group-hover:text-blue-600 transition-colors">
                        {enrollment.course?.title || 'Untitled Course'}
                      </h3>
                      <span className={`ml-2 flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status === 'COMPLETED' ? '✓ Complete' : enrollment.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {enrollment.course?.description?.substring(0, 80) || 'No description'}...
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                        <span className="text-xs font-bold text-gray-900">
                          {enrollment.status === 'COMPLETED' ? '100' : '45'}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getProgressColor(enrollment.status)} rounded-full transition-all`}
                          style={{
                            width: enrollment.status === 'COMPLETED' ? '100%' : '45%',
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/course/${enrollment.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm group/btn"
                    >
                      {enrollment.status === 'COMPLETED' ? (
                        <>
                          <CheckCircle size={16} />
                          Review Course
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          Continue Learning
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/courses"
            className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-xl p-4 group-hover:bg-opacity-30 transition-all">
                <Compass size={32} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Explore More Courses</h3>
                <p className="text-blue-100 text-sm">Discover new learning opportunities</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="group bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-xl p-4 group-hover:bg-opacity-30 transition-all">
                <TrendingUp size={32} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">View Your Profile</h3>
                <p className="text-purple-100 text-sm">Track your learning achievements</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
