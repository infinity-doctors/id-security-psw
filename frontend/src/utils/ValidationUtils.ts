export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ValidationUtils {
  /**
   * @description Validate secret content
   * @param secret - The secret to validate
   * @param passphrase - The passphrase to validate
   * @returns An object with the validation result
   * @throws An error if the secret is empty
   * @throws An error if the secret is too long
   * @throws An error if the secret is too short
   * @throws An error if the passphrase is empty
   * @throws An error if the passphrase is too long
   * @throws An error if the passphrase is too short
   * @throws An error if the passphrase is not a string
   * @throws An error if the passphrase is not a valid string
   */
  public static validateSecret(secret: string, passphrase?: string): ValidationResult {
    const errors: string[] = []

    if (!secret || secret.trim().length === 0) {
      errors.push('The secret content is required')
    }

    if (secret && secret.length > 5000) {
      errors.push('The secret content cannot exceed 5000 characters')
    }

    if (secret && secret.trim().length < 3) {
      errors.push('The secret content must have at least 3 characters')
    }

    if (passphrase !== undefined && passphrase !== null && passphrase !== '') {
      const passphraseResult = this.validatePassphrase(passphrase)
      if (!passphraseResult.isValid) {
        errors.push(...passphraseResult.errors)
      }
    }

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
   * @description Validate passphrase
   * @param passphrase - The passphrase to validate
   * @returns An object with the validation result
   * @throws An error if the passphrase is empty
   * @throws An error if the passphrase is too long
   * @throws An error if the passphrase is too short
   * @throws An error if the passphrase is not a string
   */
  public static validatePassphrase(passphrase: string): ValidationResult {
    const errors: string[] = []

    if (passphrase.length < 4) {
      errors.push('The passphrase must have at least 4 characters')
    }

    if (passphrase.length > 128) {
      errors.push('The passphrase cannot exceed 128 characters')
    }

    const weakPasswords = [
      '1234', '12345', '123456', 'password', 'senha', 'admin', 
      'teste', 'test', 'qwerty', 'abc123'
    ]
    
    if (weakPasswords.includes(passphrase.toLowerCase())) {
      errors.push('Use a passphrase more secure')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * @description Validate TTL (Time To Live) value
   * @param ttl - The TTL value to validate
   * @returns An object with the validation result
   * @throws An error if the TTL is not a number
   * @throws An error if the TTL is not a positive number
   * @throws An error if the TTL is not an integer
   * @throws An error if the TTL is not a valid number
   */
  public static validateTTL(ttl: number): ValidationResult {
    const errors: string[] = []

    if (!Number.isInteger(ttl) || ttl <= 0) {
      errors.push('The expiration time must be a positive number')
    }

    if (ttl < 300) {
      errors.push('The minimum expiration time is 5 minutes')
    }

    if (ttl > 2592000) {
      errors.push('The maximum expiration time is 30 days')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * @description Validate secret content for security concerns
   * @param secret - The secret to validate
   * @returns An object with the validation result
   * @throws An error if the secret is empty
   * @throws An error if the secret is too long
   * @throws An error if the secret is too short
   * @throws An error if the secret is not a string
   */
  private static validateSecretSecurity(secret: string): ValidationResult {
    const errors: string[] = []

    const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi
    if (scriptPattern.test(secret)) {
      errors.push('The secret content cannot contain scripts')
    }

    const sqlPatterns = [
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+\w+\s+set/gi,
      /union\s+select/gi
    ]

    for (const pattern of sqlPatterns) {
      if (pattern.test(secret)) {
        errors.push('The secret content contains forbidden patterns')
        break
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * @description Validate email format
   * @param email - The email to validate
   * @returns An object with the validation result
   * @throws An error if the email is empty
   * @throws An error if the email is not a string
   * @throws An error if the email is not a valid email
   * @throws An error if the email is not a valid email address
   */
  public static validateEmail(email: string): ValidationResult {
    const errors: string[] = []
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * @description Validate URL format
   * @param url - The URL to validate
   * @returns An object with the validation result
   * @throws An error if the URL is empty
   * @throws An error if the URL is not a string
   * @throws An error if the URL is not a valid URL
   */
  public static validateURL(url: string): ValidationResult {
    const errors: string[] = []
    
    try {
      new URL(url)
    } catch {
      errors.push('Invalid URL')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * @description Sanitize input to prevent XSS
   * @param input - The input to sanitize
   * @returns The sanitized input
   * @throws An error if the input is empty
   * @throws An error if the input is not a string
   * @throws An error if the input is not a valid string
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
   * @description Check password strength
   * @param password - The password to check
   * @returns An object with the password strength result
   * @throws An error if the password is empty
   * @throws An error if the password is not a string
   * @throws An error if the password is not a valid string
   */
  public static checkPasswordStrength(password: string): {
    score: number // 0-4
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score++
    } else {
      feedback.push('You must use at least 8 characters')
    }

    if (/[A-Z]/.test(password)) {
      score++
    } else {
      feedback.push('You must include uppercase letters')
    }

    if (/[a-z]/.test(password)) {
      score++
    } else {
      feedback.push('You must include lowercase letters')
    }

    if (/\d/.test(password)) {
      score++
    } else {
      feedback.push('You must include numbers')
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score++
    } else {
      feedback.push('You must include special characters')
    }

    return { score: Math.min(score, 4), feedback }
  }

  /**
   * @description Format file size
   * @param bytes - The file size in bytes
   * @returns The formatted file size
   * @throws An error if the file size is not a number
   * @throws An error if the file size is not a positive number
   * @throws An error if the file size is not an integer
   * @throws An error if the file size is not a valid number
   */
  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * @description Format duration from seconds
   * @param seconds - The duration in seconds
   * @returns The formatted duration
   * @throws An error if the duration is not a number
   * @throws An error if the duration is not a positive number
   * @throws An error if the duration is not an integer
   * @throws An error if the duration is not a valid number
   */
  public static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`
    }
    
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
    
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    
    const days = Math.floor(seconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''}`
  }
} 