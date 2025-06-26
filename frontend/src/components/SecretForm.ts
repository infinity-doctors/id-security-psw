import { OTSService } from '../services/OTSService'
import { ValidationUtils } from '../utils/ValidationUtils'

export class SecretForm {
  private onSecretCreated: (secretKey: string) => void
  private onError: (message: string) => void
  private otsService: OTSService

  constructor(onSecretCreated: (secretKey: string) => void, onError?: (message: string) => void) {
    this.onSecretCreated = onSecretCreated
    this.onError = onError || console.error
    this.otsService = new OTSService()
  }

  public render(): string {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-slide-up">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Compartilhamento Seguro</h1>
          <p class="text-gray-600 dark:text-gray-300">
            Crie um link seguro para compartilhar informações sensíveis que só pode ser acessado uma única vez.
          </p>
        </div>

        <!-- Form -->
        <form id="secret-form" class="space-y-6">
          <!-- Secret Content -->
          <div>
            <label for="secret-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conteúdo do Segredo *
            </label>
            <textarea
              id="secret-content"
              name="secret"
              rows="6"
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none font-mono text-sm"
              placeholder="Digite aqui o conteúdo que deseja compartilhar de forma segura..."
            ></textarea>
            <div class="mt-1 text-xs text-gray-500">
              Máximo de 5000 caracteres. O conteúdo será criptografado.
            </div>
          </div>

          <!-- TTL Selection -->
          <div>
            <label for="ttl" class="block text-sm font-medium text-gray-700 mb-2">
              Tempo de Expiração
            </label>
            <select
              id="ttl"
              name="ttl"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="300">5 minutos</option>
              <option value="900">15 minutos</option>
              <option value="1800">30 minutos</option>
              <option value="3600" selected>1 hora</option>
              <option value="14400">4 horas</option>
              <option value="86400">24 horas</option>
              <option value="259200">3 dias</option>
              <option value="604800">7 dias</option>
            </select>
            <div class="mt-1 text-xs text-gray-500">
              O link expirará automaticamente após o tempo selecionado.
            </div>
          </div>

          <!-- Optional Passphrase -->
          <div>
            <label for="passphrase" class="block text-sm font-medium text-gray-700 mb-2">
              Senha Adicional (Opcional)
            </label>
            <div class="relative">
              <input
                type="password"
                id="passphrase"
                name="passphrase"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                placeholder="Digite uma senha adicional..."
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-action="toggle-password"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <div class="mt-1 text-xs text-gray-500">
              Adicione uma camada extra de segurança com uma senha personalizada.
            </div>
          </div>

          <!-- Security Notice -->
          <div class="bg-security-50 border border-security-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-security-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <div class="text-sm">
                <h4 class="font-medium text-security-800 mb-1">Aviso de Segurança</h4>
                <ul class="text-security-700 space-y-1">
                  <li>• O link gerado só pode ser acessado uma única vez</li>
                  <li>• Após o acesso, o conteúdo será permanentemente excluído</li>
                  <li>• Compartilhe apenas através de canais seguros</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-4 pt-4">
            <button
              type="submit"
              class="flex-1 btn btn-primary"
              data-loading="Criando..."
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Criar Link Seguro
            </button>
            
            <button
              type="button"
              class="btn btn-secondary"
              data-action="clear-form"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    `
  }

  public bindEvents(container: HTMLElement): void {
    const form = container.querySelector('#secret-form') as HTMLFormElement
    const togglePasswordBtn = container.querySelector('[data-action="toggle-password"]') as HTMLButtonElement
    const clearBtn = container.querySelector('[data-action="clear-form"]') as HTMLButtonElement

    // Form submission
    form?.addEventListener('submit', this.handleSubmit.bind(this))

    // Toggle password visibility
    togglePasswordBtn?.addEventListener('click', this.togglePasswordVisibility.bind(this))

    // Clear form
    clearBtn?.addEventListener('click', this.clearForm.bind(this))

    // Character counter for textarea
    const textarea = container.querySelector('#secret-content') as HTMLTextAreaElement
    textarea?.addEventListener('input', this.updateCharacterCount.bind(this))
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault()
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    const secret = formData.get('secret') as string
    const ttl = parseInt(formData.get('ttl') as string)
    const passphrase = formData.get('passphrase') as string

    // Validation
    const validationResult = ValidationUtils.validateSecret(secret, passphrase)
    if (!validationResult.isValid) {
      this.showError(validationResult.errors.join(', '))
      return
    }

    try {
      this.setLoading(true)
      
      const result = await this.otsService.createSecret({
        secret,
        ttl,
        passphrase: passphrase || undefined
      })

      this.onSecretCreated(result.secret_key)
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Erro ao criar segredo')
    } finally {
      this.setLoading(false)
    }
  }

  private togglePasswordVisibility(): void {
    const input = document.getElementById('passphrase') as HTMLInputElement
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password'
    }
  }

  private clearForm(): void {
    const form = document.getElementById('secret-form') as HTMLFormElement
    if (form) {
      form.reset()
      this.updateCharacterCount()
    }
  }

  private updateCharacterCount(): void {
    const textarea = document.getElementById('secret-content') as HTMLTextAreaElement
    if (textarea) {
      const count = textarea.value.length
      const maxLength = 5000
      
      // Update counter display if exists
      let counter = document.querySelector('.character-counter')
      if (!counter) {
        counter = document.createElement('div')
        counter.className = 'character-counter text-xs text-gray-500 mt-1'
        textarea.parentNode?.appendChild(counter)
      }
      
      counter.textContent = `${count}/${maxLength} caracteres`
      
      if (count > maxLength) {
        counter.classList.add('text-error-500')
        textarea.classList.add('border-error-500')
      } else {
        counter.classList.remove('text-error-500')
        textarea.classList.remove('border-error-500')
      }
    }
  }

  private setLoading(loading: boolean): void {
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement
    if (submitBtn) {
      submitBtn.disabled = loading
      submitBtn.innerHTML = loading 
        ? submitBtn.dataset.loading || 'Carregando...'
        : submitBtn.getAttribute('data-original') || submitBtn.innerHTML
      
      if (!loading && !submitBtn.getAttribute('data-original')) {
        submitBtn.setAttribute('data-original', submitBtn.innerHTML)
      }
    }
  }

  private showError(message: string): void {
    this.onError(message)
    console.error('SecretForm Error:', message)
  }
} 