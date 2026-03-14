import React from 'react'
import { Link } from 'react-router-dom'
import { User, Star, Users, ArrowRight, BookOpen } from 'lucide-react'
import ProgressBar from './common/ProgressBar'
import Badge from './common/Badge'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
]

const getPlaceholder = (id) => PLACEHOLDER_IMAGES[(id || 0) % PLACEHOLDER_IMAGES.length]

const CourseCard = ({ course, progress, enrollmentId, compact = false }) => {
  const imgSrc = course.image_url || getPlaceholder(course.id)
  const instructor = course.instructor?.name || course.instructor || 'Instructor'
  const pct = progress ?? 0

  return (
    <div className="card-hover group flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video bg-gray-100">
        <img
          src={imgSrc}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.currentTarget.src = getPlaceholder(course.id) }}
        />
        {course.status && course.status !== 'ACTIVE' && (
          <div className="absolute top-2 left-2">
            <Badge variant={course.status === 'DRAFT' ? 'draft' : 'archived'}>{course.status}</Badge>
          </div>
        )}
        {pct === 100 && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" dot>Completed</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {course.category?.name && (
          <span className="text-xs text-brand-600 font-medium mb-1.5">{course.category.name}</span>
        )}

        <h3 className="text-sm font-semibold text-ink leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {course.title}
        </h3>

        {!compact && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{course.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <User size={12} />
            {instructor}
          </span>
          {course.students_count !== undefined && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {course.students_count}
            </span>
          )}
          {course.rating && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star size={12} fill="currentColor" />
              {course.rating}
            </span>
          )}
        </div>

        {/* Progress */}
        {progress !== undefined && (
          <div className="mb-4">
            <ProgressBar value={pct} showLabel size="sm" />
          </div>
        )}

        <div className="mt-auto">
          <Link
            to={`/courses/${course.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-50 text-brand-600 text-sm font-medium rounded-xl hover:bg-brand-500 hover:text-white transition-all duration-200 group/btn"
          >
            <BookOpen size={15} />
            {pct > 0 ? 'Continue Learning' : 'Start Learning'}
            <ArrowRight size={14} className="ml-auto group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
