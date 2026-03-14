import { useState, useEffect } from 'react'
import CourseCard from '../../components/CourseCard'
import { Search } from 'lucide-react'

export default function StudentCourses() {
  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([1, 2, 3])

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: 'Introduction to React',
          description: 'Learn the basics of React framework',
          category: 'Web Development',
          duration: '4 weeks',
          studentCount: 1234,
        },
        {
          id: 2,
          title: 'Python for Data Science',
          description: 'Master Python for data analysis',
          category: 'Data Science',
          duration: '6 weeks',
          studentCount: 567,
        },
        {
          id: 3,
          title: 'UI/UX Design Fundamentals',
          description: 'Create beautiful user interfaces',
          category: 'Design',
          duration: '5 weeks',
          studentCount: 890,
        },
        {
          id: 4,
          title: 'Advanced JavaScript',
          description: 'Deep dive into JavaScript concepts',
          category: 'Web Development',
          duration: '8 weeks',
          studentCount: 543,
        },
        {
          id: 5,
          title: 'Machine Learning Basics',
          description: 'Introduction to ML algorithms',
          category: 'Data Science',
          duration: '7 weeks',
          studentCount: 421,
        },
        {
          id: 6,
          title: 'Node.js Backend Development',
          description: 'Build scalable backend applications',
          category: 'Web Development',
          duration: '6 weeks',
          studentCount: 678,
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const categories = ['all', 'Web Development', 'Data Science', 'Design']

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = category === 'all' || course.category === category
    return matchesSearch && matchesCategory
  })

  const handleEnroll = (courseId) => {
    alert(`Enrolled in course ${courseId}`)
    setEnrolledCourseIds([...enrolledCourseIds, courseId])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Courses</h1>
        <p className="text-gray-600">Discover and enroll in our latest courses</p>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-8">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isEnrolled={enrolledCourseIds.includes(course.id)}
            onEnroll={handleEnroll}
            role="student"
          />
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No courses found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
