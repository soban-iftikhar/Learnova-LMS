import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Users, Clock, FileText } from 'lucide-react'
import ProgressBar from '../../components/ProgressBar'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setTimeout(() => {
      setCourse({
        id: courseId,
        title: 'Introduction to React',
        description: 'Learn the basics of React framework and build modern web applications',
        instructor: 'John Doe',
        category: 'Web Development',
        level: 'Beginner',
        duration: '4 weeks',
        studentCount: 1234,
        rating: 4.8,
        price: 'Free',
        progress: 65,
        overview: 'This comprehensive React course will teach you everything you need to build modern web applications.',
        materials: [
          { id: 1, title: 'React Basics', type: 'video', duration: '45 min' },
          { id: 2, title: 'Components and Props', type: 'video', duration: '60 min' },
          { id: 3, title: 'State Management', type: 'video', duration: '75 min' },
        ],
        quizzes: [
          { id: 1, title: 'React Basics Quiz', questions: 10, passingScore: 70 },
          { id: 2, title: 'Advanced Concepts', questions: 15, passingScore: 75 },
        ],
      })
      setLoading(false)
    }, 500)
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Course not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/courses')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Courses</span>
      </button>

      {/* Course Header */}
      <div className="card p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600">{course.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600 mb-2">{course.price}</p>
            <span className="badge-info">{course.level}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Instructor</p>
            <p className="font-semibold text-gray-900">{course.instructor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-semibold text-gray-900">{course.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Students</p>
            <p className="font-semibold text-gray-900">{course.studentCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rating</p>
            <p className="font-semibold text-gray-900">★ {course.rating}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <ProgressBar percentage={course.progress} label="Your Progress" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Materials
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'quizzes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Quizzes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
          <p className="text-gray-700 leading-relaxed">{course.overview}</p>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-4">
          {course.materials.map((material) => (
            <div key={material.id} className="card p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FileText className="text-blue-600" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">{material.title}</h3>
                  <p className="text-sm text-gray-600">{material.duration}</p>
                </div>
              </div>
              <button className="btn-primary">View</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {course.quizzes.map((quiz) => (
            <div key={quiz.id} className="card p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                <p className="text-sm text-gray-600">
                  {quiz.questions} questions • Passing Score: {quiz.passingScore}%
                </p>
              </div>
              <button className="btn-primary">Take Quiz</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
