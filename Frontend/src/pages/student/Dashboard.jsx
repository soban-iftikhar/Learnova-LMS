import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import StatCard from '../../components/StatCard'
import ProgressBar from '../../components/ProgressBar'
import CourseCard from '../../components/CourseCard'
import { BookOpen, Users, TrendingUp, Clock } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    hoursSpent: 0,
    certificatesEarned: 0,
    progressAverage: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch student dashboard data
    setTimeout(() => {
      setEnrolledCourses([
        {
          id: 1,
          title: 'Introduction to React',
          description: 'Learn the basics of React framework',
          category: 'Web Development',
          progress: 65,
          studentCount: 1234,
        },
        {
          id: 2,
          title: 'Python for Data Science',
          description: 'Master Python for data analysis',
          category: 'Data Science',
          progress: 42,
          studentCount: 567,
        },
        {
          id: 3,
          title: 'UI/UX Design Fundamentals',
          description: 'Create beautiful user interfaces',
          category: 'Design',
          progress: 78,
          studentCount: 890,
        },
      ])

      setStats({
        totalCourses: 3,
        hoursSpent: 24,
        certificatesEarned: 1,
        progressAverage: 62,
      })

      setLoading(false)
    }, 500)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-gray-600">Continue your learning journey today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Enrolled Courses" value={stats.totalCourses} icon={BookOpen} color="blue" />
        <StatCard title="Learning Hours" value={stats.hoursSpent} icon={Clock} color="purple" />
        <StatCard title="Certificates" value={stats.certificatesEarned} icon={TrendingUp} color="green" />
        <StatCard title="Avg Progress" value={`${stats.progressAverage}%`} icon={Users} color="orange" />
      </div>

      {/* Enrolled Courses Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              <div className="mb-4">
                <ProgressBar percentage={course.progress} label="Progress" size="md" />
              </div>
              <button className="btn-primary w-full">Continue Learning</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
