import { SecretForm } from './SecretForm'
import { SecretView } from './SecretView'
import { Header } from './Header'
import { Footer } from './Footer'
import { NotificationManager } from './NotificationManager'

export interface AppState {
  currentView: 'form' | 'view' | 'success'
  secretKey?: string
  error?: string
}

export class App {
  private container: HTMLElement
  private state: AppState = { currentView: 'form' }
  private notificationManager: NotificationManager

  constructor(container: HTMLElement) {
    this.container = container
    this.notificationManager = new NotificationManager()
  }

  public init(): void {
    this.render()
    this.bindEvents()
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        ${new Header().render()}
        
        <main class="flex-1 flex items-center justify-center p-4">
          <div class="w-full max-w-2xl">
            <div id="app-content" class="animate-fade-in">
              ${this.renderCurrentView()}
            </div>
          </div>
        </main>

        ${new Footer().render()}
        
        <!-- Notification container -->
        <div id="notifications" class="fixed top-4 right-4 space-y-2 z-50"></div>
      </div>
    `

    // Initialize notifications
    this.notificationManager.init(document.getElementById('notifications')!)
  }

  private renderCurrentView(): string {
    switch (this.state.currentView) {
      case 'form':
        return new SecretForm(this.handleSecretCreated.bind(this)).render()
      case 'view':
        return new SecretView(this.state.secretKey!, this.handleBackToForm.bind(this)).render()
      case 'success':
        return this.renderSuccessView()
      default:
        return new SecretForm(this.handleSecretCreated.bind(this)).render()
    }
  }

  private renderSuccessView(): string {
    return `
      <div class="bg-white rounded-xl shadow-lg p-8 text-center animate-slide-up">
        <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Segredo Criado com Sucesso!</h2>
        
        <p class="text-gray-600 mb-8">
          Seu link foi gerado e está pronto para ser compartilhado. Lembre-se de que ele só pode ser acessado uma única vez.
        </p>

        <button 
          class="btn btn-primary"
          data-action="back-to-form"
        >
          Criar Outro Segredo
        </button>
      </div>
    `
  }

  private bindEvents(): void {
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const action = target.dataset.action

      switch (action) {
        case 'back-to-form':
          this.handleBackToForm()
          break
      }
    })
  }

  private handleSecretCreated(secretKey: string): void {
    this.setState({ 
      currentView: 'view', 
      secretKey,
      error: undefined 
    })
    
    this.notificationManager.show({
      type: 'success',
      message: 'Segredo criado com sucesso!',
      duration: 3000
    })
  }

  private handleBackToForm(): void {
    this.setState({ 
      currentView: 'form',
      secretKey: undefined,
      error: undefined 
    })
  }

  private setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState }
    
    // Re-render only the content area for better performance
    const contentElement = document.getElementById('app-content')
    if (contentElement) {
      contentElement.innerHTML = this.renderCurrentView()
      contentElement.className = 'animate-fade-in'
    }
  }

  public showError(message: string): void {
    this.notificationManager.show({
      type: 'error',
      message,
      duration: 5000
    })
  }

  public showSuccess(message: string): void {
    this.notificationManager.show({
      type: 'success',
      message,
      duration: 3000
    })
  }
} 