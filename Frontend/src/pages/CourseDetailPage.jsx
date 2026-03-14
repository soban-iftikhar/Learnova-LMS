import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { courseAPI, quizAPI } from '../services/api'
import ProgressBar from '../components/ProgressBar'
import { AlertCircle, Loader, FileText, Video, HelpCircle, Users, Calendar } from 'lucide-react'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [materials, setMaterials] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [activeTab, setActiveTab] = useState('materials')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch course details
        const courseData = await courseAPI.getDetails(courseId)
        setCourse(courseData)

        // Fetch materials
        try {
          const materialsData = await courseAPI.getMaterials(courseId)
          setMaterials(materialsData || [])
        } catch (err) {
          console.warn('Error fetching materials:', err)
        }

        // Fetch quizzes
        try {
          const quizzesData = await quizAPI.getQuizzes(courseId)
          setQuizzes(quizzesData || [])
        } catch (err) {
          console.warn('Error fetching quizzes:', err)
        }
      } catch (err) {
        console.error('Error fetching course data:', err)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchData()
    }
  }, [courseId])

  const handleViewMaterial = (material) => {
    if (material.url) {
      window.open(material.url, '_blank')
    }
  }

  const handleTakeQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Course not found</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate('/courses')}
            className="mb-4 text-blue-200 hover:text-white transition"
          >
            ← Back to Courses
          </button>
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <div className="flex flex-wrap gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{course.enrolledCount || 0} students enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="inline-block px-3 py-1 bg-blue-500 rounded-full text-sm">
              {course.category}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Description */}
            <div className="bg-white rounded-lg p-6 shadow mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`flex-1 py-4 px-6 font-semibold transition ${
                      activeTab === 'materials'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      Materials ({materials.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`flex-1 py-4 px-6 font-semibold transition ${
                      activeTab === 'quizzes'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Quizzes ({quizzes.length})
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'materials' && (
                  <div className="space-y-4">
                    {materials.length > 0 ? (
                      materials.map(material => (
                        <div
                          key={material.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              {material.contentType === 'video' ? (
                                <Video className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                              ) : (
                                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                              )}
                              <div>
                                <h3 className="font-semibold text-gray-900">{material.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                                <span className="text-xs text-gray-500 mt-2 inline-block">
                                  {material.contentType.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewMaterial(material)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-8">No materials available yet</p>
                    )}
                  </div>
                )}

                {activeTab === 'quizzes' && (
                  <div className="space-y-4">
                    {quizzes.length > 0 ? (
                      quizzes.map(quiz => (
                        <div
                          key={quiz.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                <span>Passing Score: {quiz.passingScore}%</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleTakeQuiz(quiz.id)}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition whitespace-nowrap"
                            >
                              Take Quiz
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-8">No quizzes available yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg p-6 shadow sticky top-24">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
                <p className="text-gray-600">{course.instructor?.name || 'Unknown'}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Progress</h3>
                <ProgressBar progress={65} label="Course Progress" />
              </div>

              <button
                onClick={() => navigate('/courses')}
                className="w-full py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
