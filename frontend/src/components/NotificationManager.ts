export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary'
}

export class NotificationManager {
  private container: HTMLElement | null = null
  private notifications: Map<string, Notification> = new Map()
  private defaultDuration = 5000

  public init(container: HTMLElement): void {
    this.container = container
  }

  public show(notification: Omit<Notification, 'id'>): string {
    if (!this.container) {
      console.warn('NotificationManager not initialized')
      return ''
    }

    const id = this.generateId()
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? this.defaultDuration
    }

    this.notifications.set(id, fullNotification)
    this.render(fullNotification)

    // Auto-remove after duration
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, fullNotification.duration)
    }

    return id
  }

  public remove(id: string): void {
    const notification = this.notifications.get(id)
    if (!notification) return

    const element = document.getElementById(`notification-${id}`)
    if (element) {
      // Add exit animation
      element.classList.add('animate-slide-out')
      
      setTimeout(() => {
        element.remove()
        this.notifications.delete(id)
      }, 300)
    } else {
      this.notifications.delete(id)
    }
  }

  public removeAll(): void {
    Array.from(this.notifications.keys()).forEach(id => this.remove(id))
  }

  public success(message: string, duration?: number): string {
    return this.show({ type: 'success', message, duration })
  }

  public error(message: string, duration?: number): string {
    return this.show({ type: 'error', message, duration })
  }

  public warning(message: string, duration?: number): string {
    return this.show({ type: 'warning', message, duration })
  }

  public info(message: string, duration?: number): string {
    return this.show({ type: 'info', message, duration })
  }

  private render(notification: Notification): void {
    if (!this.container) return

    const element = this.createNotificationElement(notification)
    this.container.appendChild(element)

    // Trigger entrance animation
    requestAnimationFrame(() => {
      element.classList.add('animate-slide-in')
    })
  }

  private createNotificationElement(notification: Notification): HTMLElement {
    const element = document.createElement('div')
    element.id = `notification-${notification.id}`
    element.className = this.getNotificationClasses(notification.type)

    element.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${this.getNotificationIcon(notification.type)}
        </div>
        
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium ${this.getTextColorClass(notification.type)}">
            ${this.escapeHtml(notification.message)}
          </p>
          
          ${notification.actions ? this.renderActions(notification.actions) : ''}
        </div>

        <div class="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            data-notification-id="${notification.id}"
            data-action="close"
          >
            <span class="sr-only">Fechar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `

    // Bind close event
    const closeBtn = element.querySelector('[data-action="close"]')
    closeBtn?.addEventListener('click', () => {
      const id = closeBtn.getAttribute('data-notification-id')
      if (id) this.remove(id)
    })

    // Bind action events
    notification.actions?.forEach((action, index) => {
      const actionBtn = element.querySelector(`[data-action-index="${index}"]`)
      actionBtn?.addEventListener('click', action.action)
    })

    return element
  }

  private renderActions(actions: NotificationAction[]): string {
    return `
      <div class="mt-3 flex space-x-3">
        ${actions.map((action, index) => `
          <button
            type="button"
            class="text-sm font-medium ${action.style === 'primary' ? 'text-primary-600 hover:text-primary-500' : 'text-gray-600 hover:text-gray-500'}"
            data-action-index="${index}"
          >
            ${this.escapeHtml(action.label)}
          </button>
        `).join('')}
      </div>
    `
  }

  private getNotificationClasses(type: Notification['type']): string {
    const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out'
    
    const typeClasses = {
      success: 'border-l-4 border-success-500',
      error: 'border-l-4 border-error-500',
      warning: 'border-l-4 border-warning-500',
      info: 'border-l-4 border-primary-500'
    }

    return `${baseClasses} ${typeClasses[type]} p-4`
  }

  private getNotificationIcon(type: Notification['type']): string {
    const iconClasses = {
      success: 'text-success-400',
      error: 'text-error-400',
      warning: 'text-warning-400',
      info: 'text-primary-400'
    }

    const icons = {
      success: `
        <svg class="h-6 w-6 ${iconClasses.success}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      error: `
        <svg class="h-6 w-6 ${iconClasses.error}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      warning: `
        <svg class="h-6 w-6 ${iconClasses.warning}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      `,
      info: `
        <svg class="h-6 w-6 ${iconClasses.info}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `
    }

    return icons[type]
  }

  private getTextColorClass(type: Notification['type']): string {
    const colorClasses = {
      success: 'text-success-800',
      error: 'text-error-800',
      warning: 'text-warning-800',
      info: 'text-primary-800'
    }

    return colorClasses[type]
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
} 