import { SecretForm } from './SecretForm'
import { SecretView } from './SecretView'
import { Header } from './Header'
import { Footer } from './Footer'
import { NotificationManager } from './NotificationManager'
import { Router, Route } from '../utils/Router'
import { ThemeManager } from '../utils/ThemeManager'

export interface AppState {
  currentView: 'form' | 'view' | 'success' | 'retrieve'
  secretKey?: string
  retrieveKey?: string
  passphrase?: string
  error?: string
  requiresPassphrase?: boolean
}

export class App {
  private container: HTMLElement
  private state: AppState = { currentView: 'form' }
  private notificationManager: NotificationManager

  constructor(container: HTMLElement) {
    this.container = container
    this.notificationManager = new NotificationManager()
  }

  public init(initialRoute?: Route): void {
    // Initialize theme manager
    ThemeManager.init()

    if (initialRoute) {
      this.handleRoute(initialRoute)
    }

    this.render()
    this.bindEvents()

    window.addEventListener('popstate', () => {
      const route = Router.parseRoute()
      this.handleRoute(route)
    })
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
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

    this.notificationManager.init(document.getElementById('notifications')!)

    ThemeManager.refreshIcon()

    const contentElement = document.getElementById('app-content')
    if (contentElement) {
      this.bindCurrentViewEvents(contentElement)
    }
  }

  private renderCurrentView(): string {
    switch (this.state.currentView) {
      case 'form':
        return new SecretForm(
          this.handleSecretCreated.bind(this),
          this.showError.bind(this)
        ).render()
      case 'view':
        return new SecretView(this.state.secretKey!, this.handleBackToForm.bind(this)).render()
      case 'retrieve':
        return this.renderRetrieveView()
      case 'success':
        return this.renderSuccessView()
      default:
        return new SecretForm(
          this.handleSecretCreated.bind(this),
          this.showError.bind(this)
        ).render()
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
    this.container.addEventListener('click', e => {
      const target = e.target as HTMLElement

      const actionElement = target.closest('[data-action]') as HTMLElement
      const action = actionElement?.dataset.action

      switch (action) {
        case 'back-to-form':
          this.handleBackToForm()
          break
        case 'reveal-secret':
          this.handleRevealSecret(e)
          break
        case 'toggle-retrieve-password':
          e.preventDefault()
          e.stopPropagation()
          this.toggleRetrievePasswordVisibility()
          break
        case 'toggle-theme':
          e.preventDefault()
          e.stopPropagation()
          console.log('Toggle theme clicked!', {
            clickedElement: target.tagName,
            actionElement: actionElement?.tagName,
            currentTheme: ThemeManager.getCurrentTheme(),
            timestamp: new Date().toISOString(),
          })
          ThemeManager.toggle()
          break
      }
    })
  }

  private bindCurrentViewEvents(container: HTMLElement): void {
    switch (this.state.currentView) {
      case 'form':
        const secretForm = new SecretForm(
          this.handleSecretCreated.bind(this),
          this.showError.bind(this)
        )
        secretForm.bindEvents(container)
        break
      case 'view':
        const secretView = new SecretView(this.state.secretKey!, this.handleBackToForm.bind(this))
        secretView.bindEvents(container)
        break
      case 'retrieve':
        const retrieveForm = container.querySelector('#retrieve-form') as HTMLFormElement
        retrieveForm?.addEventListener('submit', e => {
          e.preventDefault()
          this.handleRevealSecret(e)
        })
        break
    }
  }

  private handleSecretCreated(secretKey: string): void {
    this.setState({
      currentView: 'view',
      secretKey,
      error: undefined,
    })

    this.notificationManager.show({
      type: 'success',
      message: 'Segredo criado com sucesso!',
      duration: 3000,
    })
  }

  private handleBackToForm(): void {
    Router.goHome()
  }

  private toggleRetrievePasswordVisibility(): void {
    const input = document.getElementById('retrieve-passphrase') as HTMLInputElement
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password'
    }
  }

  private async handleRevealSecret(e?: Event): Promise<void> {
    if (e) {
      e.preventDefault()
    }

    if (!this.state.retrieveKey) {
      this.showError('Chave do segredo não encontrada')
      return
    }

    // Primeira verificação: tentar acessar sem senha para detectar se está expirado
    if (!this.state.requiresPassphrase && !this.state.passphrase) {
      try {
        const { OTSService } = await import('../services/OTSService')
        const otsService = new OTSService()
        
        // Tentativa inicial sem senha para detectar estado do segredo
        const result = await otsService.retrieveSecret(this.state.retrieveKey)
        
        // Se chegou até aqui, o segredo existe e não precisa de senha
        this.setState({
          currentView: 'view',
          secretKey: this.state.retrieveKey,
          retrieveKey: undefined,
        })

        this.showRetrievedSecret(result.secret)
        return
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao recuperar segredo'

        // Verificar se é erro de expiração/visualização - prioridade máxima
        if (
          errorMessage.includes('expirou') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('visualizado') ||
          errorMessage.includes('viewed') ||
          errorMessage.includes('não está mais disponível') ||
          errorMessage.includes('consumed') ||
          errorMessage.includes('no longer available') ||
          errorMessage.includes('Segredo expirado ou já visualizado')
        ) {
          this.showError(errorMessage)
          setTimeout(() => {
            Router.goHome()
          }, 3000)
          return
        }

        // Verificar se é erro de rate limit
        if (errorMessage.includes('rate limited') || errorMessage.includes('Muitas tentativas')) {
          this.showError(errorMessage)
          setTimeout(() => {
            Router.goHome()
          }, 3000)
          return
        }

        // Se chegou até aqui, provavelmente precisa de senha
        if (
          errorMessage.includes('Este segredo requer uma senha para ser acessado') ||
          errorMessage.includes('Senha inválida, segredo expirado ou já visualizado') ||
          errorMessage.includes('passphrase') ||
          errorMessage.includes('senha')
        ) {
          this.setState({
            requiresPassphrase: true,
          })
          return
        }

        // Qualquer outro erro
        this.showError(errorMessage)
        setTimeout(() => {
          Router.goHome()
        }, 3000)
        return
      }
    }

    // Segunda verificação: usuário já forneceu senha ou está tentando com senha
    let passphrase = this.state.passphrase
    if (this.state.requiresPassphrase && !passphrase) {
      const passphraseInput = document.getElementById('retrieve-passphrase') as HTMLInputElement
      passphrase = passphraseInput?.value || ''

      if (!passphrase.trim()) {
        this.showError('Por favor, digite a senha do segredo')
        return
      }
    }

    try {
      const { OTSService } = await import('../services/OTSService')
      const otsService = new OTSService()

      const finalPassphrase = this.state.requiresPassphrase
        ? passphrase
        : this.state.passphrase || passphrase

      const result = await otsService.retrieveSecret(this.state.retrieveKey, finalPassphrase)

      this.setState({
        currentView: 'view',
        secretKey: this.state.retrieveKey,
        retrieveKey: undefined,
      })

      this.showRetrievedSecret(result.secret)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao recuperar segredo'

      // Prioridade para erros de expiração/visualização
      if (
        errorMessage.includes('expirou') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('visualizado') ||
        errorMessage.includes('viewed') ||
        errorMessage.includes('não está mais disponível') ||
        errorMessage.includes('consumed') ||
        errorMessage.includes('no longer available') ||
        errorMessage.includes('Segredo expirado ou já visualizado')
      ) {
        this.showError(errorMessage)
        setTimeout(() => {
          Router.goHome()
        }, 3000)
        return
      }

      // Rate limit
      if (errorMessage.includes('rate limited') || errorMessage.includes('Muitas tentativas')) {
        this.showError(errorMessage)
        setTimeout(() => {
          Router.goHome()
        }, 3000)
        return
      }

      // Outros erros
      this.showError(errorMessage)
      setTimeout(() => {
        Router.goHome()
      }, 3000)
    }
  }

  private showRetrievedSecret(secretContent: string): void {
    const contentElement = document.getElementById('app-content')
    if (contentElement) {
      contentElement.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-8 animate-slide-up">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Segredo Revelado</h1>
            <p class="text-gray-600">
              O conteúdo foi revelado com sucesso. Este link agora está inativo.
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo do Segredo
            </label>
            <div class="relative">
              <textarea
                readonly
                class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                rows="6"
                id="revealed-secret"
              >${secretContent}</textarea>
              <button
                type="button"
                class="absolute top-3 right-3 btn btn-secondary btn-sm"
                onclick="navigator.clipboard.writeText(document.getElementById('revealed-secret').value); this.textContent = 'Copiado!'; setTimeout(() => this.textContent = 'Copiar', 2000)"
              >
                Copiar
              </button>
            </div>
          </div>

          <div class="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-warning-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div class="text-sm">
                <h4 class="font-medium text-warning-800 mb-1">Importante</h4>
                <p class="text-warning-700">
                  Este segredo foi consumido e não pode mais ser acessado. O link está agora inativo.
                </p>
              </div>
            </div>
          </div>

          <div class="text-center">
            <button
              type="button"
              class="btn btn-primary"
              data-action="back-to-form"
            >
              Criar Novo Segredo
            </button>
          </div>
        </div>
      `
    }
  }

  private setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState }

    const contentElement = document.getElementById('app-content')
    if (contentElement) {
      contentElement.innerHTML = this.renderCurrentView()
      contentElement.className = 'animate-fade-in'

      this.bindCurrentViewEvents(contentElement)
    }
  }

  public showError(message: string): void {
    this.notificationManager.show({
      type: 'error',
      message,
      duration: 5000,
    })
  }

  public showSuccess(message: string): void {
    this.notificationManager.show({
      type: 'success',
      message,
      duration: 3000,
    })
  }

  private handleRoute(route: Route): void {
    switch (route.type) {
      case 'home':
        this.setState({
          currentView: 'form',
          retrieveKey: undefined,
          passphrase: undefined,
          secretKey: undefined,
          error: undefined,
        })
        break
      case 'secret':
        if (route.params?.secretKey) {
          this.setState({
            currentView: 'retrieve',
            retrieveKey: route.params.secretKey,
            passphrase: route.params.passphrase,
            secretKey: undefined,
            error: undefined,
            requiresPassphrase: false,
          })
        }
        break
      case 'notfound':
        this.showError('Página não encontrada')
        this.setState({ currentView: 'form' })
        break
    }
  }

  private renderRetrieveView(): string {
    const hasPassphraseInUrl = !!this.state.passphrase
    const needsPassphraseInput = this.state.requiresPassphrase && !hasPassphraseInUrl

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-slide-up">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Segredo Compartilhado</h1>
          <p class="text-gray-600 dark:text-gray-300">
            ${
              needsPassphraseInput
                ? 'Digite a senha para acessar o conteúdo compartilhado.'
                : 'Clique no botão abaixo para revelar o conteúdo compartilhado.'
            }
            <span class="font-medium text-warning-600 dark:text-warning-400 block mt-1">Atenção: só pode ser visualizado uma única vez!</span>
          </p>
        </div>

        <form id="retrieve-form" class="space-y-6">
          ${
            needsPassphraseInput
              ? `
          <!-- Passphrase Input -->
          <div>
            <label for="retrieve-passphrase" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha do Segredo
            </label>
            <div class="relative">
              <input
                type="password"
                id="retrieve-passphrase"
                name="passphrase"
                class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-400"
                placeholder="Digite a senha para acessar o segredo..."
                required
                autocomplete="off"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                data-action="toggle-retrieve-password"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
          </div>
          `
              : ''
          }

          <!-- Reveal Button -->
          <div class="text-center space-y-4">
            <button
              type="submit"
              class="btn btn-primary w-full"
              data-action="reveal-secret"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Revelar Segredo
            </button>
            
            <div class="text-sm text-gray-500 dark:text-gray-400">
              ID do Segredo: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">${this.state.retrieveKey?.substring(0, 10)}...</code>
            </div>
          </div>
        </form>

        <div class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50 rounded-lg p-4 mt-6">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-warning-600 dark:text-warning-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div class="text-sm">
              <h4 class="font-medium text-warning-800 dark:text-warning-200 mb-1">Importante</h4>
              <p class="text-warning-700 dark:text-warning-300">
                Após visualizar o conteúdo, ele será permanentemente excluído e não poderá ser acessado novamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
