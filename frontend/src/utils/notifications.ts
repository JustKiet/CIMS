import { ToastType } from '@/components/ui/Toast'

interface NotificationOptions {
  type: ToastType
  message: string
  duration?: number
}

class NotificationManager {
  private toastContainer: HTMLElement | null = null

  private getToastContainer(): HTMLElement {
    if (!this.toastContainer) {
      this.toastContainer = document.getElementById('toast-container')
      if (!this.toastContainer) {
        this.toastContainer = document.createElement('div')
        this.toastContainer.id = 'toast-container'
        this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2'
        document.body.appendChild(this.toastContainer)
      }
    }
    return this.toastContainer
  }

  private createToastElement(options: NotificationOptions): HTMLElement {
    const toastDiv = document.createElement('div')
    
    // Create the toast content
    const bgColor = this.getBackgroundColor(options.type)
    const textColor = this.getTextColor(options.type)
    const icon = this.getIcon(options.type)
    
    toastDiv.innerHTML = `
      <div class="flex items-center gap-3 ${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-md">
        ${icon}
        <div class="flex-1">
          <p class="font-medium">${options.message}</p>
        </div>
        <button class="text-current opacity-70 hover:opacity-100 ml-2" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    // Auto-remove after duration
    const duration = options.duration || 4000
    setTimeout(() => {
      if (toastDiv.parentElement) {
        toastDiv.remove()
      }
    }, duration)
    
    return toastDiv
  }

  private getBackgroundColor(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  private getTextColor(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  private getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return `<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`
      case 'error':
        return `<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`
      case 'warning':
        return `<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>`
      case 'info':
        return `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`
      default:
        return ''
    }
  }

  show(options: NotificationOptions): void {
    const container = this.getToastContainer()
    const toastElement = this.createToastElement(options)
    container.appendChild(toastElement)
  }

  success(message: string, duration?: number): void {
    this.show({ type: 'success', message, duration })
  }

  error(message: string, duration?: number): void {
    this.show({ type: 'error', message, duration })
  }

  warning(message: string, duration?: number): void {
    this.show({ type: 'warning', message, duration })
  }

  info(message: string, duration?: number): void {
    this.show({ type: 'info', message, duration })
  }
}

export const notifications = new NotificationManager()
