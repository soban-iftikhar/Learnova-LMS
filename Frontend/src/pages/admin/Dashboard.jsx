import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // In real app: const res = await adminApi.getDashboard()
      setStats({
        total_users: 500,
        total_students: 400,
        total_instructors: 50,
        total_admins: 5,
        total_courses: 50,
        total_enrollments: 2500,
        active_users_today: 245,
        system_uptime: '99.9%'
      })

      setRecentActivities([
        { id: 1, user: 'John Doe', action: 'Registered', timestamp: '2026-03-15 10:30' },
        { id: 2, user: 'Jane Smith', action: 'Created Course', timestamp: '2026-03-15 10:15' },
        { id: 3, user: 'Bob Johnson', action: 'Enrolled in Course', timestamp: '2026-03-15 09:45' },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">System overview and management.</p>
      </div>

      {/* User Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-ink mb-4">User Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.total_users} />
          <StatCard label="Students" value={stats?.total_students} />
          <StatCard label="Instructors" value={stats?.total_instructors} />
          <StatCard label="Admins" value={stats?.total_admins} />
        </div>
      </div>

      {/* Course Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-ink mb-4">Course Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Courses" value={stats?.total_courses} />
          <StatCard label="Enrollments" value={stats?.total_enrollments} />
          <StatCard label="Active Today" value={stats?.active_users_today} />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-ink mb-4">System Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mb-2">System Uptime</p>
            <p className="text-3xl font-bold text-green-600">{stats?.system_uptime}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 mb-2">Status</p>
            <p className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Healthy
            </p>
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-ink mb-4">Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => navigate('/admin/users')}
            variant="secondary"
            className="text-left h-auto py-4"
          >
            <div className="font-semibold text-sm">👥 Users</div>
            <div className="text-xs text-gray-600">Manage all users</div>
          </Button>
          <Button
            onClick={() => navigate('/admin/instructors')}
            variant="secondary"
            className="text-left h-auto py-4"
          >
            <div className="font-semibold text-sm">👨‍🏫 Instructors</div>
            <div className="text-xs text-gray-600">Manage instructors</div>
          </Button>
          <Button
            onClick={() => navigate('/admin/students')}
            variant="secondary"
            className="text-left h-auto py-4"
          >
            <div className="font-semibold text-sm">👨‍🎓 Students</div>
            <div className="text-xs text-gray-600">Manage students</div>
          </Button>
          <Button
            onClick={() => navigate('/admin/courses')}
            variant="secondary"
            className="text-left h-auto py-4"
          >
            <div className="font-semibold text-sm">📚 Courses</div>
            <div className="text-xs text-gray-600">Manage courses</div>
          </Button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-ink mb-4">Recent Activities</h2>
        {recentActivities.length === 0 ? (
          <EmptyState title="No activities" description="System activities will appear here." />
        ) : (
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-400">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
