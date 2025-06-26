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
    this.api.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      }
    )

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
   * @description Create a new secret
   * @param request - The request object containing the secret, TTL, and passphrase
   * @returns The response object containing the secret key, metadata key, TTL, and passphrase required
   * @throws An error if the response is invalid
   * @throws An error if the secret key is not found
   * @throws An error if the metadata key is not found
   * @throws An error if the TTL is not found
   */
  public async createSecret(request: CreateSecretRequest): Promise<CreateSecretResponse> {
    try {
      const formData = new URLSearchParams()
      formData.append('secret', request.secret)
      formData.append('ttl', request.ttl.toString())
      if (request.passphrase) {
        formData.append('passphrase', request.passphrase)
      }

      const response = await this.api.post<CreateSecretResponse>('/v1/share', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      if (!response.data || !response.data.secret_key) {
        throw new Error('Resposta inválida do servidor')
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * @description Retrieve a secret by key
   * @param secretKey - The secret key to retrieve
   * @param passphrase - The passphrase to retrieve the secret
   * @returns The response object containing the secret and metadata key
   * @throws An error if the response is invalid
   * @throws An error if the secret is not found
   * @throws An error if the metadata key is not found
   */
  public async retrieveSecret(
    secretKey: string, 
    passphrase?: string
  ): Promise<RetrieveSecretResponse> {
    try {
      const formData = new URLSearchParams()
      if (passphrase) {
        formData.append('passphrase', passphrase)
      }

      const response = await this.api.post<any>(`/v1/secret/${secretKey}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      if (!response.data || !response.data.value) {
        throw new Error('Segredo não encontrado ou já foi visualizado')
      }

      return {
        secret: response.data.value,
        metadata_key: response.data.secret_key || secretKey
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * @description Get secret metadata without revealing the secret
   * @param metadataKey - The metadata key to retrieve
   * @returns The response object containing the secret key, metadata key, TTL, created, updated, passphrase required, and state
   * @throws An error if the response is invalid
   * @throws An error if the secret key is not found
   * @throws An error if the metadata key is not found
   * @throws An error if the TTL is not found
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
   * @description Get service status
   * @returns The response object containing the status and version
   * @throws An error if the response is invalid
   * @throws An error if the status is not found
   * @throws An error if the version is not found
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
   * @description Check if a secret exists without revealing it
   * @param secretKey - The secret key to check
   * @returns The response object containing the boolean value indicating if the secret exists
   * @throws An error if the response is invalid
   * @throws An error if the secret key is not found
   * @throws An error if the secret key is not found
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
   * @description Generate a shareable URL for a secret
   * @param secretKey - The secret key to generate the URL for
   * @param passphrase - The passphrase to generate the URL for
   * @returns The shareable URL for the secret
   * @throws An error if the secret key is not found
   * @throws An error if the passphrase is not found
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
   * @description Validate secret key format
   * @param key - The secret key to validate
   * @returns The boolean value indicating if the secret key is valid
   * @throws An error if the secret key is not found
   * @throws An error if the secret key is not found
   */
  public static isValidSecretKey(key: string): boolean {
    const secretKeyRegex = /^[a-zA-Z0-9]{20,32}$/
    return secretKeyRegex.test(key)
  }

  /**
   * @description Error handler
   * @param error - The error to handle
   * @returns The error object
   * @throws An error if the error is not found
   * @throws An error if the error is not found
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new Error('Timeout: Verifique sua conexão com a internet')
      }

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

      if (error.request) {
        return new Error('Erro de conexão: Verifique sua internet e tente novamente')
      }
    }

    return error instanceof Error 
      ? error 
      : new Error('Erro desconhecido ocorreu')
  }
} 