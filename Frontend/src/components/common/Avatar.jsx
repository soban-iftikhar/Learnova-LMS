import React from 'react'

const sizeMap = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-sm',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
}

const colorMap = [
  'bg-brand-100 text-brand-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
]

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

const getColor = (name = '') =>
  colorMap[name.charCodeAt(0) % colorMap.length]

const Avatar = ({ name, src, size = 'md', className = '', online }) => {
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizeMap[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold flex-shrink-0 ${!src ? getColor(name) : ''}`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-brand-500' : 'bg-gray-300'}`} />
      )}
    </div>
  )
}

export default Avatar
