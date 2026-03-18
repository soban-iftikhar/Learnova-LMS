import React from 'react'
import { Link } from 'react-router-dom'
import { User, Star, Users, ArrowRight, BookOpen } from 'lucide-react'
import ProgressBar from './common/ProgressBar'
import Badge from './common/Badge'

// Deterministic color palette for course thumbnails based on ID.
// Ensures consistent colors across sessions while providing visual variety.
export const PALETTE = [
  { bg: 'bg-brand-500',  text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
  { bg: 'bg-sky-500',    text: 'text-white' },
  { bg: 'bg-amber-500',  text: 'text-white' },
  { bg: 'bg-rose-500',   text: 'text-white' },
  { bg: 'bg-emerald-500',text: 'text-white' },
]

// Select palette color based on course ID — deterministic hashing.
export const getPaletteColor = (id) => PALETTE[(id || 0) % PALETTE.length]

const CourseCard = ({ course, progress, enrollmentId, compact = false }) => {
  const hasImage = !!course.image_url
  const p = getPaletteColor(course.id)
  const pct = progress ?? 0
  const instructor = course.instructor?.name || course.instructor || 'Instructor'

  return (
    <div className="card-hover group flex flex-col h-full">
      {/* Thumbnail — image OR colored title block */}
      <div className="relative overflow-hidden aspect-video">
        {hasImage ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        {/* Colored fallback — shown when no image or img error */}
        <div
          className={`${p.bg} ${p.text} absolute inset-0 flex items-center justify-center p-4 ${hasImage ? 'hidden' : 'flex'}`}
          style={{ display: hasImage ? 'none' : 'flex' }}
        >
          <p className="text-center font-bold text-lg leading-tight line-clamp-3">{course.title}</p>
        </div>

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
          <span className="flex items-center gap-1 truncate">
            <User size={12} />{instructor}
          </span>
          {course.students_count > 0 && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Users size={12} />{course.students_count}
            </span>
          )}
          {course.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-500 flex-shrink-0">
              <Star size={12} fill="currentColor" />{course.rating}
            </span>
          )}
        </div>

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
