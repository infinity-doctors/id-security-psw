export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ValidationUtils {
  /**
   * Validate secret content
   */
  public static validateSecret(secret: string, passphrase?: string): ValidationResult {
    const errors: string[] = []

    // Required field validation
    if (!secret || secret.trim().length === 0) {
      errors.push('O conteúdo do segredo é obrigatório')
    }

    // Length validation
    if (secret && secret.length > 5000) {
      errors.push('O conteúdo não pode exceder 5000 caracteres')
    }

    // Minimum content validation
    if (secret && secret.trim().length < 3) {
      errors.push('O conteúdo deve ter pelo menos 3 caracteres')
    }

    // Passphrase validation (if provided)
    if (passphrase !== undefined && passphrase !== null && passphrase !== '') {
      const passphraseResult = this.validatePassphrase(passphrase)
      if (!passphraseResult.isValid) {
        errors.push(...passphraseResult.errors)
      }
    }

    // Content security validation
    const securityResult = this.validateSecretSecurity(secret)
    if (!securityResult.isValid) {
      errors.push(...securityResult.errors)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate passphrase
   */
  public static validatePassphrase(passphrase: string): ValidationResult {
    const errors: string[] = []

    if (passphrase.length < 4) {
      errors.push('A senha deve ter pelo menos 4 caracteres')
    }

    if (passphrase.length > 128) {
      errors.push('A senha não pode exceder 128 caracteres')
    }

    // Check for obvious weak passwords
    const weakPasswords = [
      '1234', '12345', '123456', 'password', 'senha', 'admin', 
      'teste', 'test', 'qwerty', 'abc123'
    ]
    
    if (weakPasswords.includes(passphrase.toLowerCase())) {
      errors.push('Use uma senha mais segura')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate TTL (Time To Live) value
   */
  public static validateTTL(ttl: number): ValidationResult {
    const errors: string[] = []

    if (!Number.isInteger(ttl) || ttl <= 0) {
      errors.push('Tempo de expiração deve ser um número positivo')
    }

    // Minimum 5 minutes (300 seconds)
    if (ttl < 300) {
      errors.push('Tempo mínimo de expiração é 5 minutos')
    }

    // Maximum 30 days (2592000 seconds)
    if (ttl > 2592000) {
      errors.push('Tempo máximo de expiração é 30 dias')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate secret content for security concerns
   */
  private static validateSecretSecurity(secret: string): ValidationResult {
    const errors: string[] = []

    // Check for potential script injection
    const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi
    if (scriptPattern.test(secret)) {
      errors.push('Conteúdo não pode conter scripts')
    }

    // Check for SQL injection patterns (basic)
    const sqlPatterns = [
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+\w+\s+set/gi,
      /union\s+select/gi
    ]

    for (const pattern of sqlPatterns) {
      if (pattern.test(secret)) {
        errors.push('Conteúdo contém padrões não permitidos')
        break
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate email format
   */
  public static validateEmail(email: string): ValidationResult {
    const errors: string[] = []
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate URL format
   */
  public static validateURL(url: string): ValidationResult {
    const errors: string[] = []
    
    try {
      new URL(url)
    } catch {
      errors.push('URL inválida')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Sanitize input to prevent XSS
   */
  public static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Check password strength
   */
  public static checkPasswordStrength(password: string): {
    score: number // 0-4
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8) {
      score++
    } else {
      feedback.push('Use pelo menos 8 caracteres')
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score++
    } else {
      feedback.push('Inclua letras maiúsculas')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score++
    } else {
      feedback.push('Inclua letras minúsculas')
    }

    // Number check
    if (/\d/.test(password)) {
      score++
    } else {
      feedback.push('Inclua números')
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score++
    } else {
      feedback.push('Inclua caracteres especiais')
    }

    return { score: Math.min(score, 4), feedback }
  }

  /**
   * Format file size
   */
  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Format duration from seconds
   */
  public static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`
    }
    
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
    }
    
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      return `${hours} hora${hours !== 1 ? 's' : ''}`
    }
    
    const days = Math.floor(seconds / 86400)
    return `${days} dia${days !== 1 ? 's' : ''}`
  }
} 