// components/ui/Toast.tsx
'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    // Tự động xóa sau 3 giây
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — góc trên bên phải, không chặn màn hình */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border
              backdrop-blur-md min-w-[260px] max-w-[340px]
              animate-slide-in
              ${toast.type === 'success'
                ? 'bg-brand-dark-2/95 border-green-500/30 text-white'
                : 'bg-brand-dark-2/95 border-red-500/30 text-white'
              }
            `}
          >
            {/* Icon */}
            {toast.type === 'success'
              ? <CheckCircle size={18} className="text-green-400 shrink-0" />
              : <XCircle size={18} className="text-red-400 shrink-0" />
            }

            {/* Message */}
            <span className="text-sm font-medium flex-1">{toast.message}</span>

            {/* Nút đóng */}
            <button
              onClick={() => remove(toast.id)}
              className="text-white/40 hover:text-white/80 transition shrink-0"
            >
              <X size={14} />
            </button>

            {/* Progress bar */}
            <div className={`
              absolute bottom-0 left-0 h-[2px] rounded-full
              ${toast.type === 'success' ? 'bg-green-400' : 'bg-red-400'}
              animate-shrink
            `} />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-shrink {
          animation: shrink 3s linear forwards;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

// Hook để dùng trong các component
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}