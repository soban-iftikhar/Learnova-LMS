import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import AppShell from '../../components/common/AppShell';
import StatCard from '../../components/common/StatCard';
import CourseCard from '../../components/common/CourseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 5,
    completedCourses: 2,
    attendanceRate: 92,
    pendingAssignments: 3,
  });

  const [recentCourses, setRecentCourses] = useState([
    {
      id: 1,
      title: 'Introduction to React',
      instructor: 'Sarah Johnson',
      progress: 75,
      image: 'https://via.placeholder.com/300x150?text=React+Fundamentals',
    },
    {
      id: 2,
      title: 'Web Design Principles',
      instructor: 'Mike Davis',
      progress: 45,
      image: 'https://via.placeholder.com/300x150?text=Web+Design',
    },
    {
      id: 3,
      title: 'JavaScript Mastery',
      instructor: 'Emma Wilson',
      progress: 60,
      image: 'https://via.placeholder.com/300x150?text=JavaScript',
    },
  ]);

  const [upcomingTasks, setUpcomingTasks] = useState([
    {
      id: 1,
      title: 'React Assignment 3',
      course: 'Introduction to React',
      dueDate: '2024-03-20',
      type: 'assignment',
    },
    {
      id: 2,
      title: 'Design Quiz 2',
      course: 'Web Design Principles',
      dueDate: '2024-03-18',
      type: 'quiz',
    },
    {
      id: 3,
      title: 'JavaScript Project',
      course: 'JavaScript Mastery',
      dueDate: '2024-03-25',
      type: 'project',
    },
  ]);

  const [courseProgress, setCourseProgress] = useState([
    { name: 'React Fundamentals', progress: 75 },
    { name: 'Web Design', progress: 45 },
    { name: 'JavaScript', progress: 60 },
  ]);

  const handleContinueLearn = (courseId) => {
    console.log('Continue learning course:', courseId);
    // Navigate to course details
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'assignment':
        return '📝';
      case 'quiz':
        return '✓';
      case 'project':
        return '📦';
      default:
        return '📌';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{user?.fullName?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Here is your learning progress today. Keep up the great work!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            title="Total Courses"
            value={stats.totalCourses}
            description="Enrolled courses"
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completedCourses}
            description="Finished courses"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Attendance"
            value={`${stats.attendanceRate}%`}
            description="This month"
            color="purple"
          />
          <StatCard
            icon={AlertCircle}
            title="Pending"
            value={stats.pendingAssignments}
            description="Assignments due"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Courses & Tasks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Recent Courses</h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentCourses.slice(0, 2).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onContinue={handleContinueLearn}
                  />
                ))}
              </div>
            </div>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your progress across all enrolled courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseProgress.map((course) => (
                  <div key={course.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {course.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {course.progress}%
                      </span>
                    </div>
                    <ProgressBar value={course.progress} max={100} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upcoming Tasks */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Don't miss these deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <span className="text-lg mt-0.5">{getTaskIcon(task.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.course}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;
