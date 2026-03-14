import React, { useState, useRef, useEffect } from 'react'

const Dropdown = ({ trigger, items = [], align = 'right', className = '' }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(v => !v)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div className={`absolute ${alignClass} top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-1.5 z-50 animate-slide-down`}>
          {items.map((item, i) => {
            if (item.type === 'divider') {
              return <div key={i} className="my-1.5 border-t border-gray-100" />
            }
            if (item.type === 'label') {
              return (
                <div key={i} className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </div>
              )
            }
            return (
              <button
                key={i}
                onClick={() => { setOpen(false); item.onClick?.() }}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${item.danger
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-ink hover:bg-surface-muted'
                  }`}
                disabled={item.disabled}
              >
                {item.icon && <span className="flex-shrink-0 text-gray-400">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dropdown
