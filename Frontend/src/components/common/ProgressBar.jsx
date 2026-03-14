import React from 'react'

const colorMap = {
  brand:  'bg-brand-500',
  amber:  'bg-amber-400',
  rose:   'bg-rose-400',
  sky:    'bg-sky-400',
  violet: 'bg-violet-400',
}

const sizeMap = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'brand',
  size = 'md',
  showLabel = false,
  label,
  className = '',
  animated = true,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-xs text-gray-500">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-ink">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${sizeMap[size]} ${colorMap[color]} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
