import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface CreateSecretRequest {
  secret: string
  ttl: number
  passphrase?: string
}

export interface CreateSecretResponse {
  secret_key: string
  metadata_key: string
  ttl: number
  passphrase_required: boolean
}

export interface RetrieveSecretResponse {
  secret: string
  metadata_key: string
}

export interface SecretMetadata {
  secret_key: string
  metadata_key: string
  ttl: number
  created: string
  updated: string
  passphrase_required: boolean
  state: 'new' | 'viewed' | 'expired'
}

export class OTSService {
  private api: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = '/api'
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Request interceptor for monitoring
        return config
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      }
    )
  }

  /**
   * Create a new secret
   */
  public async createSecret(request: CreateSecretRequest): Promise<CreateSecretResponse> {
    try {
      const payload = {
        secret: request.secret,
        ttl: request.ttl.toString(),
        ...(request.passphrase && { passphrase: request.passphrase })
      }

      const response = await this.api.post<CreateSecretResponse>('/secret', payload)
      
      if (!response.data || !response.data.secret_key) {
        throw new Error('Resposta inválida do servidor')
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Retrieve a secret by key
   */
  public async retrieveSecret(
    secretKey: string, 
    passphrase?: string
  ): Promise<RetrieveSecretResponse> {
    try {
      const url = passphrase 
        ? `/secret/${secretKey}/${encodeURIComponent(passphrase)}`
        : `/secret/${secretKey}`

      const response = await this.api.get<RetrieveSecretResponse>(url)
      
      if (!response.data || !response.data.secret) {
        throw new Error('Segredo não encontrado ou já foi visualizado')
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get secret metadata without revealing the secret
   */
  public async getSecretMetadata(metadataKey: string): Promise<SecretMetadata> {
    try {
      const response = await this.api.get<SecretMetadata>(`/private/${metadataKey}`)
      
      if (!response.data) {
        throw new Error('Metadata não encontrada')
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get service status
   */
  public async getStatus(): Promise<{ status: string; version?: string }> {
    try {
      const response = await this.api.get<{ status: string; version?: string }>('/status')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Check if a secret exists without revealing it
   */
  public async checkSecretExists(secretKey: string): Promise<boolean> {
    try {
      const response = await this.api.head(`/secret/${secretKey}`)
      return response.status === 200
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      throw this.handleError(error)
    }
  }

  /**
   * Generate a shareable URL for a secret
   */
  public generateSecretUrl(secretKey: string, passphrase?: string): string {
    const baseUrl = window.location.origin
    let url = `${baseUrl}/secret/${secretKey}`
    
    if (passphrase) {
      url += `?p=${encodeURIComponent(passphrase)}`
    }
    
    return url
  }

  /**
   * Validate secret key format
   */
  public static isValidSecretKey(key: string): boolean {
    // OTS secret keys are typically alphanumeric with specific length
    const secretKeyRegex = /^[a-zA-Z0-9]{20,32}$/
    return secretKeyRegex.test(key)
  }

  /**
   * Error handler
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      // Network/timeout errors
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new Error('Timeout: Verifique sua conexão com a internet')
      }

      // HTTP errors
      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        switch (status) {
          case 400:
            return new Error(data?.message || 'Dados inválidos fornecidos')
          case 401:
            return new Error('Não autorizado: Verifique suas credenciais')
          case 403:
            return new Error('Acesso negado')
          case 404:
            return new Error('Segredo não encontrado ou já foi visualizado')
          case 429:
            return new Error('Muitas tentativas: Tente novamente em alguns minutos')
          case 500:
            return new Error('Erro interno do servidor: Tente novamente mais tarde')
          case 503:
            return new Error('Serviço temporariamente indisponível')
          default:
            return new Error(data?.message || `Erro HTTP ${status}`)
        }
      }

      // Request errors (no response received)
      if (error.request) {
        return new Error('Erro de conexão: Verifique sua internet e tente novamente')
      }
    }

    // Unknown error
    return error instanceof Error 
      ? error 
      : new Error('Erro desconhecido ocorreu')
  }
} 