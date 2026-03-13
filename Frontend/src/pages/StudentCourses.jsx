import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService, studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Star, Users, Clock, BookOpen, CheckCircle } from 'lucide-react';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    loadCourses();
    loadEnrollments();
  }, [user?.id]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    try {
      const response = await studentService.getEnrollments(user?.id);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    }
  };

  useEffect(() => {
    let filtered = courses.filter(course => {
      const matchesSearch =
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, courses]);

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);
      await studentService.enrollCourse(courseId);
      await loadEnrollments();
      alert('Successfully enrolled in course!');
    } catch (error) {
      alert('Failed to enroll in course. You may already be enrolled.');
    } finally {
      setEnrolling(null);
    }
  };

  const getEnrollmentForCourse = (courseId) => {
    return enrollments.find(e => e.course?.id === courseId);
  };

  const categories = ['all', ...new Set(courses.map(c => c.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Explore Courses
          </h1>
          <p className="text-gray-600 text-lg">Discover and enroll in world-class courses</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Search Input */}
            <div className="relative group">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors bg-gray-50 font-medium"
              />
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <Filter size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors bg-gray-50 font-medium appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600 font-medium">
              <span className="text-blue-600 font-bold">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600 font-medium">Loading courses...</p>
            </div>
          </div>
        )}

        {/* No Courses Found */}
        {!loading && filteredCourses.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-100">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => {
              const enrollment = getEnrollmentForCourse(course.id);
              const isEnrolled = !!enrollment;

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all transform duration-300 border border-gray-100"
                >
                  {/* Course Header with Gradient */}
                  <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-white group-hover:bg-opacity-30 transition-all"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={64} className="text-white opacity-40 group-hover:opacity-60 transition-opacity" />
                    </div>
                    {course.category && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                          {course.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-7">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
                      {course.description || 'No description available'}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {course.instructor?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Instructor</p>
                        <p className="text-sm font-semibold text-gray-800">{course.instructor?.email || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isEnrolled ? (
                      <Link
                        to={`/course/${enrollment.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold text-sm group/btn"
                      >
                        <CheckCircle size={18} />
                        Continue Learning
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling === course.id}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling === course.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Enrolling...
                          </span>
                        ) : (
                          'Enroll Now'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
