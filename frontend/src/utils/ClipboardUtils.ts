export class ClipboardUtils {
  /**
   * Copy text to clipboard using modern Clipboard API or fallback
   */
  public static async copyToClipboard(text: string): Promise<void> {
    if (!text) {
      throw new Error('Texto não pode ser vazio')
    }

    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        return
      } catch (error) {
        console.warn('Clipboard API failed, falling back to legacy method:', error)
        // Fall through to legacy method
      }
    }

    // Fallback for older browsers or non-secure contexts
    await this.fallbackCopyToClipboard(text)
  }

  /**
   * Legacy clipboard copy method
   */
  private static async fallbackCopyToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create temporary textarea
      const textArea = document.createElement('textarea')
      textArea.value = text

      // Make it invisible but not display: none (which would make it unselectable)
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      textArea.setAttribute('readonly', '')

      document.body.appendChild(textArea)

      try {
        // Select the text
        textArea.focus()
        textArea.select()
        textArea.setSelectionRange(0, text.length)

        // Execute copy command
        const successful = document.execCommand('copy')
        
        if (!successful) {
          throw new Error('document.execCommand failed')
        }

        resolve()
      } catch (error) {
        reject(new Error('Falha ao copiar para área de transferência'))
      } finally {
        // Clean up
        document.body.removeChild(textArea)
      }
    })
  }

  /**
   * Read text from clipboard
   */
  public static async readFromClipboard(): Promise<string> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API não está disponível')
    }

    if (!window.isSecureContext) {
      throw new Error('Clipboard só funciona em contexto seguro (HTTPS)')
    }

    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      throw new Error('Falha ao ler da área de transferência')
    }
  }

  /**
   * Check if clipboard API is available
   */
  public static isClipboardSupported(): boolean {
    return !!(navigator.clipboard || document.execCommand)
  }

  /**
   * Check if clipboard read is available
   */
  public static isClipboardReadSupported(): boolean {
    return !!(navigator.clipboard && navigator.clipboard.readText)
  }

  /**
   * Copy with user feedback
   */
  public static async copyWithFeedback(
    text: string,
    successCallback?: () => void,
    errorCallback?: (error: Error) => void
  ): Promise<void> {
    try {
      await this.copyToClipboard(text)
      successCallback?.()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro desconhecido')
      errorCallback?.(err)
      throw err
    }
  }

  /**
   * Copy formatted content (useful for sharing)
   */
  public static async copyFormattedContent(data: {
    title?: string
    url?: string
    description?: string
    additionalInfo?: string[]
  }): Promise<void> {
    const parts: string[] = []

    if (data.title) {
      parts.push(data.title)
      parts.push('')
    }

    if (data.description) {
      parts.push(data.description)
      parts.push('')
    }

    if (data.url) {
      parts.push(`🔗 ${data.url}`)
      parts.push('')
    }

    if (data.additionalInfo && data.additionalInfo.length > 0) {
      parts.push(...data.additionalInfo)
    }

    const formattedText = parts.join('\n').trim()
    await this.copyToClipboard(formattedText)
  }

  /**
   * Copy secret link with security warning
   */
  public static async copySecretLink(url: string, expirationTime?: string): Promise<void> {
    const warning = '⚠️ IMPORTANTE: Este link só pode ser acessado uma única vez'
    const expiration = expirationTime ? `e expirará em ${expirationTime}` : 'e expirará automaticamente'
    
    const content = [
      '🔒 Link Seguro - ID Security PSW',
      '',
      url,
      '',
      `${warning} ${expiration}.`,
      '',
      '📱 Compartilhe apenas através de canais seguros.',
      '✅ Confirme com o destinatário que recebeu o link.'
    ].join('\n')

    await this.copyToClipboard(content)
  }

  /**
   * Validate clipboard content before copying
   */
  public static validateContentBeforeCopy(content: string): {
    isValid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []

    // Check for sensitive patterns
    const sensitivePatterns = [
      { pattern: /password/gi, message: 'Contém a palavra "password"' },
      { pattern: /secret/gi, message: 'Contém a palavra "secret"' },
      { pattern: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, message: 'Possível número de cartão de crédito' },
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, message: 'Possível SSN/CPF' }
    ]

    for (const { pattern, message } of sensitivePatterns) {
      if (pattern.test(content)) {
        warnings.push(message)
      }
    }

    // Check content length
    if (content.length > 10000) {
      warnings.push('Conteúdo muito longo (>10KB)')
    }

    return {
      isValid: warnings.length === 0,
      warnings
    }
  }

  /**
   * Get clipboard permissions status
   */
  public static async getClipboardPermission(): Promise<PermissionState | 'unsupported'> {
    if (!navigator.permissions || !navigator.clipboard) {
      return 'unsupported'
    }

    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
      return permission.state
    } catch {
      return 'unsupported'
    }
  }
} 