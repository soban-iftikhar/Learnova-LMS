import React from 'react'
import { BookOpen, AlertCircle, SearchX } from 'lucide-react'
import Button from './Button'

export const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'Nothing here yet',
  description,
  action,
  actionLabel,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
      <Icon size={28} className="text-brand-400" />
    </div>
    <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 max-w-xs mb-6">{description}</p>}
    {action && actionLabel && (
      <Button onClick={action} size="sm">{actionLabel}</Button>
    )}
  </div>
)

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
      <AlertCircle size={28} className="text-red-400" />
    </div>
    <h3 className="text-base font-semibold text-ink mb-1">Error</h3>
    <p className="text-sm text-gray-400 max-w-xs mb-6">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="sm">Try Again</Button>
    )}
  </div>
)

export const NoResults = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <SearchX size={28} className="text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-ink mb-1">No results found</h3>
    <p className="text-sm text-gray-400 max-w-xs">
      {query ? `No results for "${query}". Try a different search.` : 'No items match your filters.'}
    </p>
  </div>
)
