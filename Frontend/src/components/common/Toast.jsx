import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

const icons = {
  success: <CheckCircle2 size={18} className="text-brand-500" />,
  error:   <XCircle size={18} className="text-red-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info:    <Info size={18} className="text-sky-500" />,
}

const ToastItem = ({ toast, onRemove }) => (
  <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl shadow-card-hover px-4 py-3 min-w-72 max-w-sm animate-slide-up">
    <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
    <div className="flex-1 min-w-0">
      {toast.title && <p className="text-sm font-semibold text-ink">{toast.title}</p>}
      <p className="text-sm text-gray-500">{toast.message}</p>
    </div>
    <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
      <X size={16} />
    </button>
  </div>
)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now()
    setToasts(t => [...t, { id, type, title, message }])
    if (duration > 0) {
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error:   (message, title) => addToast({ type: 'error', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    info:    (message, title) => addToast({ type: 'info', message, title }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Portal */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
