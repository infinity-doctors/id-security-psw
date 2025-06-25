import { ClipboardUtils } from '../utils/ClipboardUtils'
import QRCode from 'qrcode'

export class SecretView {
  private secretKey: string
  private onBack: () => void
  private baseUrl: string

  constructor(secretKey: string, onBack: () => void) {
    this.secretKey = secretKey
    this.onBack = onBack
    this.baseUrl = window.location.origin
  }

  public render(): string {
    const secretUrl = `${this.baseUrl}/secret/${this.secretKey}`
    
    return `
      <div class="bg-white rounded-xl shadow-lg p-8 animate-slide-up">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Link Seguro Criado!</h2>
          <p class="text-gray-600">
            Seu link foi gerado com sucesso. Compartilhe-o de forma segura.
          </p>
        </div>

        <!-- Secret URL Display -->
        <div class="mb-8">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Link do Segredo
          </label>
          
          <div class="relative">
            <input
              type="text"
              id="secret-url"
              value="${secretUrl}"
              readonly
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm selection:bg-primary-100"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary-600 transition-colors"
              data-action="copy-url"
              title="Copiar link"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700">
              QR Code
            </label>
            <button
              type="button"
              class="text-sm text-primary-600 hover:text-primary-700"
              data-action="toggle-qr"
            >
              <span class="qr-toggle-text">Mostrar QR Code</span>
            </button>
          </div>
          
          <div id="qr-container" class="hidden">
            <div class="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
              <canvas id="qr-code"></canvas>
            </div>
            <p class="text-xs text-gray-500 text-center mt-2">
              Escaneie com seu dispositivo móvel para acessar o link
            </p>
          </div>
        </div>

        <!-- Security Information -->
        <div class="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-8">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-warning-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div class="text-sm">
              <h4 class="font-medium text-warning-800 mb-2">Lembrete Importante</h4>
              <ul class="text-warning-700 space-y-1">
                <li>• <strong>Uma única visualização:</strong> O link será invalidado após o primeiro acesso</li>
                <li>• <strong>Compartilhamento seguro:</strong> Use canais seguros (Signal, WhatsApp, email criptografado)</li>
                <li>• <strong>Verificação:</strong> Confirme com o destinatário que recebeu o link</li>
                <li>• <strong>Tempo limitado:</strong> O link expirará conforme o tempo configurado</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            class="flex-1 btn btn-primary"
            data-action="copy-url"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copiar Link
          </button>
          
          <button
            type="button"
            class="flex-1 btn btn-secondary"
            data-action="share"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
            </svg>
            Compartilhar
          </button>
          
          <button
            type="button"
            class="btn btn-outline"
            data-action="back"
          >
            Criar Outro
          </button>
        </div>
      </div>
    `
  }

  public async bindEvents(container: HTMLElement): Promise<void> {
    const copyBtn = container.querySelectorAll('[data-action="copy-url"]')
    const shareBtn = container.querySelector('[data-action="share"]') as HTMLButtonElement
    const backBtn = container.querySelector('[data-action="back"]') as HTMLButtonElement
    const toggleQrBtn = container.querySelector('[data-action="toggle-qr"]') as HTMLButtonElement

    // Copy URL functionality
    copyBtn.forEach(btn => {
      btn.addEventListener('click', this.handleCopyUrl.bind(this))
    })

    // Share functionality
    shareBtn?.addEventListener('click', this.handleShare.bind(this))

    // Back to form
    backBtn?.addEventListener('click', this.onBack)

    // Toggle QR Code
    toggleQrBtn?.addEventListener('click', this.toggleQrCode.bind(this))

    // Generate QR Code
    await this.generateQrCode()
  }

  private async handleCopyUrl(): Promise<void> {
    const urlInput = document.getElementById('secret-url') as HTMLInputElement
    if (urlInput) {
      try {
        await ClipboardUtils.copyToClipboard(urlInput.value)
        this.showSuccess('Link copiado para a área de transferência!')
        
        // Visual feedback
        urlInput.select()
        setTimeout(() => {
          urlInput.blur()
        }, 1000)
      } catch (error) {
        this.showError('Erro ao copiar o link')
      }
    }
  }

  private async handleShare(): Promise<void> {
    const secretUrl = `${this.baseUrl}/secret/${this.secretKey}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link Seguro - ID Security PSW',
          text: 'Compartilhamento seguro de informação sensível',
          url: secretUrl
        })
      } catch (error) {
        // User canceled or error occurred
        this.fallbackShare(secretUrl)
      }
    } else {
      this.fallbackShare(secretUrl)
    }
  }

  private fallbackShare(url: string): void {
    // Create temporary textarea for mobile sharing
    const textArea = document.createElement('textarea')
    textArea.value = `Link seguro: ${url}\n\n⚠️ IMPORTANTE: Este link só pode ser acessado uma única vez e expirará automaticamente.`
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      this.showSuccess('Conteúdo copiado! Cole em seu app de mensagens.')
    } catch (error) {
      this.showError('Erro ao preparar compartilhamento')
    }
    
    document.body.removeChild(textArea)
  }

  private async toggleQrCode(): Promise<void> {
    const container = document.getElementById('qr-container')
    const toggleText = document.querySelector('.qr-toggle-text')
    
    if (container && toggleText) {
      const isHidden = container.classList.contains('hidden')
      
      if (isHidden) {
        container.classList.remove('hidden')
        toggleText.textContent = 'Ocultar QR Code'
        
        // Generate QR code if not already generated
        const canvas = document.getElementById('qr-code') as HTMLCanvasElement
        if (canvas && !canvas.hasAttribute('data-generated')) {
          await this.generateQrCode()
        }
      } else {
        container.classList.add('hidden')
        toggleText.textContent = 'Mostrar QR Code'
      }
    }
  }

  private async generateQrCode(): Promise<void> {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    if (canvas && !canvas.hasAttribute('data-generated')) {
      try {
        const secretUrl = `${this.baseUrl}/secret/${this.secretKey}`
        
        await QRCode.toCanvas(canvas, secretUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        })
        
        canvas.setAttribute('data-generated', 'true')
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }
  }

  private showSuccess(message: string): void {
    // This would typically trigger a notification
    console.log('Success:', message)
  }

  private showError(message: string): void {
    // This would typically trigger a notification
    console.error('Error:', message)
  }
} 