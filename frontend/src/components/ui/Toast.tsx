import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose?: () => void
}

const toastStyles = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-500 text-white'
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

export const Toast: React.FC<ToastProps> = ({ type, message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const Icon = toastIcons[type]

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose?.()
      }, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div 
      className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-2 transition-opacity duration-300 ${
        toastStyles[type]
      } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <Icon className="h-5 w-5" />
      <span>{message}</span>
    </div>
  )
}

// Toast manager for programmatic usage
class ToastManager {
  private toasts: Array<{ id: number; element: HTMLElement }> = []
  private nextId = 1

  show(type: ToastType, message: string, duration = 3000) {
    const id = this.nextId++
    const toastElement = document.createElement('div')
    toastElement.id = `toast-${id}`
    
    // Create and render the toast
    const Icon = toastIcons[type]
    toastElement.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-2 transition-opacity duration-300 ${toastStyles[type]}`
    toastElement.style.transform = `translateY(${this.toasts.length * 70}px)`
    
    toastElement.innerHTML = `
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${this.getIconSvg(type)}
      </svg>
      <span>${message}</span>
    `
    
    document.body.appendChild(toastElement)
    this.toasts.push({ id, element: toastElement })

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id)
    }, duration)

    return id
  }

  private getIconSvg(type: ToastType): string {
    switch (type) {
      case 'success':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
      case 'error':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
      case 'warning':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>'
      case 'info':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
      default:
        return ''
    }
  }

  remove(id: number) {
    const toastIndex = this.toasts.findIndex(t => t.id === id)
    if (toastIndex === -1) return

    const toast = this.toasts[toastIndex]
    toast.element.style.opacity = '0'
    
    setTimeout(() => {
      if (document.body.contains(toast.element)) {
        document.body.removeChild(toast.element)
      }
      this.toasts.splice(toastIndex, 1)
      // Reposition remaining toasts
      this.repositionToasts()
    }, 300)
  }

  private repositionToasts() {
    this.toasts.forEach((toast, index) => {
      toast.element.style.transform = `translateY(${index * 70}px)`
    })
  }

  clear() {
    this.toasts.forEach(toast => {
      if (document.body.contains(toast.element)) {
        document.body.removeChild(toast.element)
      }
    })
    this.toasts = []
  }
}

export const toast = new ToastManager()
