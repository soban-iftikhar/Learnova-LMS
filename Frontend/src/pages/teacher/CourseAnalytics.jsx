import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StatCard from '../../components/StatCard'
import { Users, TrendingUp, BookOpen, Star } from 'lucide-react'

export default function CourseAnalytics() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setAnalytics({
        courseTitle: 'React Fundamentals',
        totalEnrollments: 234,
        completionRate: 68,
        averageRating: 4.8,
        totalHours: 1234,
        enrollments: [
          { id: 1, name: 'John Doe', progress: 85, status: 'In Progress' },
          { id: 2, name: 'Jane Smith', progress: 100, status: 'Completed' },
          { id: 3, name: 'Bob Johnson', progress: 45, status: 'In Progress' },
          { id: 4, name: 'Alice Brown', progress: 0, status: 'Not Started' },
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/teacher/courses')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Courses</span>
      </button>

      <h1 className="text-4xl font-bold text-gray-900 mb-8">Course Analytics: {analytics?.courseTitle}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Enrollments" value={analytics?.totalEnrollments} icon={Users} color="blue" />
        <StatCard title="Completion Rate" value={`${analytics?.completionRate}%`} icon={TrendingUp} color="green" />
        <StatCard title="Avg Rating" value={analytics?.averageRating} icon={Star} color="yellow" />
        <StatCard title="Total Hours" value={analytics?.totalHours} icon={BookOpen} color="purple" />
      </div>

      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Student Progress</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-900">Student Name</th>
                <th className="text-left p-4 font-semibold text-gray-900">Progress</th>
                <th className="text-left p-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.enrollments.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">{student.name}</td>
                  <td className="p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{student.progress}%</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.status === 'Completed'
                          ? 'badge-success'
                          : student.status === 'In Progress'
                            ? 'badge-info'
                            : 'badge-warning'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
