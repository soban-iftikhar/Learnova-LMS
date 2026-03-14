import React from 'react'

const StatCard = ({ label, value, icon: Icon, color = 'brand', subtitle, trend }) => {
  const colorMap = {
    brand:  { bg: 'bg-brand-50',  icon: 'text-brand-500',  border: 'border-brand-100' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  border: 'border-amber-100' },
    rose:   { bg: 'bg-rose-50',   icon: 'text-rose-500',   border: 'border-rose-100' },
    sky:    { bg: 'bg-sky-50',    icon: 'text-sky-500',    border: 'border-sky-100' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-500', border: 'border-violet-100' },
  }

  const c = colorMap[color] || colorMap.brand

  return (
    <div className="card p-6 flex items-start gap-4 hover:shadow-card-hover transition-shadow duration-300">
      <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={c.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-ink">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
          </p>
        )}
      </div>
    </div>
  )
}

export default StatCard
