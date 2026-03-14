import { Users, Clock } from 'lucide-react'

const CourseCard = ({ course, isEnrolled, onEnroll, role = 'student' }) => {
  return (
    <div className="card p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{course.description}</p>

      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Users size={16} />
          <span>{course.studentCount} students</span>
        </div>
        {course.duration && (
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{course.duration}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
          {course.category}
        </span>

        {role === 'student' ? (
          <button
            onClick={() => onEnroll(course.id)}
            disabled={isEnrolled}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isEnrolled
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isEnrolled ? 'Enrolled' : 'Enroll'}
          </button>
        ) : (
          <button className="btn-primary text-sm">View</button>
        )}
      </div>
    </div>
  )
}

export default CourseCard
