export class ClipboardUtils {
  /**
   * @description Copy text to clipboard using modern Clipboard API or fallback
   * @param text - The text to copy to clipboard
   * @returns A promise that resolves when the text is copied to clipboard
   * @throws An error if the text is empty
   * @throws An error if the Clipboard API is not available
   * @throws An error if the Clipboard API is not available in a secure context
   * @throws An error if the Clipboard API is not available in an older browser
   * @throws An error if the Clipboard API is not available in a non-secure context
   */
  public static async copyToClipboard(text: string): Promise<void> {
    if (!text) {
      throw new Error('The text cannot be empty')
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        return
      } catch (error) {
        console.warn('Clipboard API failed, falling back to legacy method:', error)
      }
    }

    await this.fallbackCopyToClipboard(text)
  }

  /**
   * @description Copy text to clipboard using legacy method
   * @param text - The text to copy to clipboard
   * @returns A promise that resolves when the text is copied to clipboard
   * @throws An error if the text is empty
   * @throws An error if the Clipboard API is not available
   * @throws An error if the Clipboard API is not available in a secure context
   * @throws An error if the Clipboard API is not available in an older browser
   * @throws An error if the Clipboard API is not available in a non-secure context
   */
  private static async fallbackCopyToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea')
      textArea.value = text

      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      textArea.setAttribute('readonly', '')

      document.body.appendChild(textArea)

      try {
        textArea.focus()
        textArea.select()
        textArea.setSelectionRange(0, text.length)

        const successful = document.execCommand('copy')
        
        if (!successful) {
          throw new Error('document.execCommand failed')
        }

        resolve()
      } catch (error) {
        reject(new Error('Failed to copy to clipboard'))
      } finally {
        document.body.removeChild(textArea)
      }
    })
  }

  /**
   * @description Read text from clipboard
   * @returns The text from clipboard
   * @throws An error if the Clipboard API is not available
   * @throws An error if the Clipboard API is not available in a secure context
   * @throws An error if the Clipboard API is not available in an older browser
   * @throws An error if the Clipboard API is not available in a non-secure context
   */
  public static async readFromClipboard(): Promise<string> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API is not available')
    }

    if (!window.isSecureContext) {
      throw new Error('Clipboard only works in secure context (HTTPS)')
    }

    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      throw new Error('Failed to read from clipboard')
    }
  }

  /**
   * @description Check if clipboard API is available
   * @returns True if the Clipboard API is available, false otherwise
   */
  public static isClipboardSupported(): boolean {
    return !!(navigator.clipboard || document.execCommand)
  }

  /**
   * @description Check if clipboard read is available
   * @returns True if the Clipboard read is available, false otherwise
   */
  public static isClipboardReadSupported(): boolean {
    return !!(navigator.clipboard && navigator.clipboard.readText)
  }

  /**
   * @description Copy with user feedback
   * @param text - The text to copy to clipboard
   * @param successCallback - The callback to call when the text is copied to clipboard
   * @param errorCallback - The callback to call when the text is copied to clipboard
   * @returns A promise that resolves when the text is copied to clipboard
   * @throws An error if the text is empty
   * @throws An error if the Clipboard API is not available
   * @throws An error if the Clipboard API is not available in a secure context
   * @throws An error if the Clipboard API is not available in an older browser
   * @throws An error if the Clipboard API is not available in a non-secure context
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
      const err = error instanceof Error ? error : new Error('Unknown error')
      errorCallback?.(err)
      throw err
    }
  }

  /**
   * @description Copy formatted content (useful for sharing)
   * @param data - The data to copy to clipboard
   * @returns A promise that resolves when the data is copied to clipboard
   * @throws An error if the data is empty
   * @throws An error if the Clipboard API is not available
   * @throws An error if the Clipboard API is not available in a secure context
   * @throws An error if the Clipboard API is not available in an older browser
   * @throws An error if the Clipboard API is not available in a non-secure context
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
   * @description Copy secret link with security warning
   * @param url - The URL to copy to clipboard
   * @param expirationTime - The expiration time of the link
   * @returns A promise that resolves when the link is copied to clipboard
   * @throws An error if the URL is empty
   * @throws An error if the Clipboard API is not available
   * @throws An error if the Clipboard API is not available in a secure context
   * @throws An error if the Clipboard API is not available in an older browser
   * @throws An error if the Clipboard API is not available in a non-secure context
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
   * @description Validate clipboard content before copying
   * @param content - The content to validate
   * @returns An object with the validation result
   * @throws An error if the content is empty
   * @throws An error if the Clipboard API
   */
  public static validateContentBeforeCopy(content: string): {
    isValid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []

    const sensitivePatterns = [
      { pattern: /password/gi, message: 'Contains the word "password"' },
      { pattern: /secret/gi, message: 'Contains the word "secret"' },
      { pattern: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, message: 'Possible credit card number' },
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, message: 'Possible SSN/CPF' }
    ]

    for (const { pattern, message } of sensitivePatterns) {
      if (pattern.test(content)) {
        warnings.push(message)
      }
    }

    if (content.length > 10000) {
      warnings.push('The content is too long (>10KB)')
    }

    return {
      isValid: warnings.length === 0,
      warnings
    }
  }

  /**
   * @description Get clipboard permissions status
   * @returns The clipboard permissions status
   * @throws An error if the Clipboard API is not available
   * @throws An error if the Clipboard API is not available in a secure context
   * @throws An error if the Clipboard API is not available in an older browser
   * @throws An error if the Clipboard API is not available in a non-secure context
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