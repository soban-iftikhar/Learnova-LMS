import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  FileText,
  Play,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [contents, setContents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      // Load enrollment details
      const enrollmentResponse = await courseService.getEnrollmentDetails(id);
      setEnrollment(enrollmentResponse.data);

      // Load course content
      const contentResponse = await courseService.getEnrollmentContent(id);
      setContents(contentResponse.data);

      // Load quizzes (if available)
      // Note: This endpoint might need adjustment based on actual API
      try {
        const quizResponse = await courseService.getCourseQuizzes(id);
        setQuizzes(quizResponse.data || []);
      } catch (e) {
        console.log('Quizzes not available or endpoint not implemented');
      }
    } catch (error) {
      console.error('Failed to load course details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-gray-600">Loading course details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/courses"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </Link>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">Course not found</p>
          </div>
        </div>
      </div>
    );
  }

  const course = enrollment.course || {};
  const progress = enrollment.progress || 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/courses"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-blue-100 mb-4">{course.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-500 bg-opacity-50 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} />
                <span className="text-sm">Instructor</span>
              </div>
              <p className="font-semibold">
                {course.instructor?.email || 'N/A'}
              </p>
            </div>

            <div className="bg-blue-500 bg-opacity-50 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} />
                <span className="text-sm">Status</span>
              </div>
              <p className="font-semibold capitalize">
                {enrollment.enrollmentStatus || 'ACTIVE'}
              </p>
            </div>

            <div className="bg-blue-500 bg-opacity-50 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} />
                <span className="text-sm">Progress</span>
              </div>
              <p className="font-semibold">{progress}%</p>
            </div>

            {course.category && (
              <div className="bg-blue-500 bg-opacity-50 rounded p-4">
                <span className="text-sm">Category</span>
                <p className="font-semibold capitalize">{course.category}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Course Progress</h3>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Content Section */}
            {contents.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Course Content
                </h2>

                <div className="space-y-4">
                  {contents.map((content, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() =>
                          setExpandedModule(
                            expandedModule === index ? null : index
                          )
                        }
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {content.type === 'video' ? (
                            <Play
                              size={20}
                              className="text-red-500 flex-shrink-0"
                            />
                          ) : (
                            <FileText
                              size={20}
                              className="text-blue-500 flex-shrink-0"
                            />
                          )}
                          <div className="text-left">
                            <p className="font-semibold text-gray-800">
                              {content.title}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {content.type || 'Document'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`transition-transform ${
                            expandedModule === index ? 'rotate-180' : ''
                          }`}
                        >
                          ▼
                        </span>
                      </button>

                      {expandedModule === index && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 mb-4">
                            {content.description ||
                              'No description available'}
                          </p>
                          <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            {content.type === 'video'
                              ? 'Watch Video'
                              : 'Download'}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center mb-8">
                <p className="text-gray-600">No course content available yet</p>
              </div>
            )}

            {/* Quizzes Section */}
            {quizzes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Assessments
                </h2>
                <div className="space-y-4">
                  {quizzes.map(quiz => (
                    <div
                      key={quiz.id}
                      className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {quiz.questionCount} questions
                        </p>
                      </div>
                      <Link
                        to={`/quiz/${quiz.id}`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Take Quiz
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Enrollment Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Enrollment Details
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600">Enrollment Date</p>
                  <p className="font-semibold text-gray-800">
                    {enrollment.enrollmentDate
                      ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Status</p>
                  <p
                    className={`font-semibold ${
                      enrollment.enrollmentStatus === 'ACTIVE'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {enrollment.enrollmentStatus || 'ACTIVE'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Grade</p>
                  <p className="font-semibold text-gray-800">
                    {enrollment.grade || 'Not graded'}
                  </p>
                </div>
              </div>

              {enrollment.enrollmentStatus === 'ACTIVE' && (
                <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Continue Learning
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
