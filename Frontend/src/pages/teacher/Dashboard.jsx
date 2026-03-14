import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import StatCard from '../../components/StatCard'
import { BookOpen, Users, TrendingUp, Star } from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalEnrollments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        { id: 1, title: 'React Fundamentals', students: 234, rating: 4.8 },
        { id: 2, title: 'Advanced JavaScript', students: 156, rating: 4.6 },
        { id: 3, title: 'Node.js Basics', students: 189, rating: 4.7 },
      ])

      setStats({
        totalCourses: 3,
        totalStudents: 579,
        averageRating: 4.7,
        totalEnrollments: 579,
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.name.split(' ')[0]}!</h1>
        <p className="text-gray-600">Manage your courses and track student progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Courses" value={stats.totalCourses} icon={BookOpen} color="blue" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="purple" />
        <StatCard title="Avg Rating" value={stats.averageRating} icon={Star} color="yellow" />
        <StatCard title="Enrollments" value={stats.totalEnrollments} icon={TrendingUp} color="green" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="card p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.students} students • Rating: {course.rating}★</p>
              </div>
              <button className="btn-primary">Manage</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
