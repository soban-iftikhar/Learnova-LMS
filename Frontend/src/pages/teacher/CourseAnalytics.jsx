import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import Spinner from '../../components/common/Spinner'
import { EmptyState } from '../../components/common/EmptyState'

export default function CourseAnalytics() {
  const { courseId } = useParams()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [courseId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // In real app: const res = await coursesApi.getCourseAnalytics(courseId)
      setAnalytics({
        course_title: 'Java Basics',
        total_students: 45,
        active_students: 40,
        completion_rate: 60,
        average_score: 78.5,
        engagement_rate: 85,
        student_performance: [
          { id: 1, name: 'John Doe', progress: 75, quiz_avg: 82, assignment_avg: 80, attendance: 90 },
          { id: 2, name: 'Jane Smith', progress: 90, quiz_avg: 88, assignment_avg: 92, attendance: 95 },
          { id: 3, name: 'Bob Johnson', progress: 45, quiz_avg: 65, assignment_avg: 70, attendance: 70 },
        ],
        module_engagement: [
          { id: 1, name: 'Module 1: Basics', completion_rate: 95, avg_time_spent: 120 },
          { id: 2, name: 'Module 2: OOP', completion_rate: 80, avg_time_spent: 150 },
          { id: 3, name: 'Module 3: Advanced', completion_rate: 50, avg_time_spent: 90 },
        ]
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-2">{analytics?.course_title} - Analytics</h1>
      <p className="text-gray-500 mb-8">Course performance and student engagement metrics.</p>

      {/* Main Stats *r}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Students" value={analytics?.total_students} />
        <StatCard label="Active" value={analytics?.active_students} />
        <StatCard label="Completion" value={`${analytics?.completion_rate}%`} />
        <StatCard label="Avg Score" value={`${analytics?.average_score}%`} />
        <StatCard label="Engagement" value={`${analytics?.engagement_rate}%`} />
      </div>

      {/* Student Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-ink mb-4">Student Performance</h2>
        {analytics?.student_performance.length === 0 ? (
          <EmptyState title="No data" description="Student data will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Student</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Progress</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Quiz Avg</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Assignment Avg</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.student_performance.map(student => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{student.progress}%</span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900 font-medium">{student.quiz_avg}%</td>
                    <td className="py-3 px-4 text-center text-gray-900 font-medium">{student.assignment_avg}%</td>
                    <td className="py-3 px-4 text-center text-gray-900 font-medium">{student.attendance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Module Engagement */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-ink mb-4">Module Engagement</h2>
        {analytics?.module_engagement.length === 0 ? (
          <EmptyState title="No data" description="Module data will appear here." />
        ) : (
          <div className="space-y-4">
            {analytics?.module_engagement.map(module => (
              <div key={module.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                    <p className="text-sm text-gray-500">Avg time spent: {module.avg_time_spent} minutes</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-500">{module.completion_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${module.completion_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
