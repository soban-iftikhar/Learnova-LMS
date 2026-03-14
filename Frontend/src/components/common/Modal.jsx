import React, { useEffect } from 'react'
import { X } from 'lucide-react'

const sizeMap = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-full mx-4',
}

const Modal = ({ isOpen, onClose, title, children, size = 'md', hideClose = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative w-full ${sizeMap[size]} bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden`}>
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
            {!hideClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-auto"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
