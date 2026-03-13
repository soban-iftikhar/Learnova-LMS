import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService, studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter } from 'lucide-react';

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
      await loadEnrollments(); // Reload enrollments to update UI
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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Explore Courses
        </h1>
        <p className="text-gray-600 mb-8">Find and enroll in amazing courses</p>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading courses...</div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No courses found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const enrollment = getEnrollmentForCourse(course.id);
              const isEnrolled = !!enrollment;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* Course Image Placeholder */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-40 flex items-center justify-center">
                    <div className="text-white text-4xl font-bold opacity-20">
                      {course.title.charAt(0)}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">
                        {course.title}
                      </h3>
                      {course.category && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {course.category}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>

                    <div className="mb-4 text-sm text-gray-500">
                      <p>
                        Instructor:{' '}
                        <span className="font-semibold text-gray-700">
                          {course.instructor?.email || 'N/A'}
                        </span>
                      </p>
                    </div>

                    {isEnrolled ? (
                      <Link
                        to={`/course/${enrollment.id}`}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition inline-block text-center"
                      >
                        Continue Learning →
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling === course.id}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
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
