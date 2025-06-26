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
   * @description Retrieves a secret using its key and optional passphrase
   * @param secretKey - The secret key to retrieve
   * @param passphrase - Optional passphrase if the secret requires one
   * @returns The response object containing the secret
   * @throws An error if the secret is not found, expired, or passphrase is incorrect
   */
  public async retrieveSecret(
    secretKey: string,
    passphrase?: string
  ): Promise<{ secret: string }> {
    try {
      const body = new URLSearchParams()
      if (passphrase) {
        body.append('passphrase', passphrase)
      }

      const response = await axios.post<any>(`${this.baseURL}/v1/secret/${secretKey}`, body, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      })

      if (response.data.message) {
        throw new Error('Este segredo não está disponível. Pode estar expirado, ter sido acessado anteriormente, ter uma senha incorreta ou não existir.')
      }

      const secretValue = response.data.value || response.data.secret
      if (!secretValue) {
        throw new Error('Este segredo não está disponível. Pode estar expirado, ter sido acessado anteriormente, ter uma senha incorreta ou não existir.')
      }

      return { secret: secretValue }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 && error.response?.data?.message?.includes('Unknown secret')) {
          throw new Error('Este segredo não está disponível. Pode estar expirado, ter sido acessado anteriormente, ter uma senha incorreta ou não existir.')
        }
        
        throw this.handleError(error, !!passphrase)
      } else {
        if (error instanceof Error && error.message.includes('Este segredo não está disponível')) {
          throw error
        }
      }
      
      throw new Error('Este segredo não está disponível. Pode estar expirado, ter sido acessado anteriormente, ter uma senha incorreta ou não existir.')
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
      throw this.handleError(error, false)
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
      throw this.handleError(error, false)
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
      throw this.handleError(error, false)
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
  private handleError(error: any, hasPassphrase: boolean = false): Error {
    console.error('[OTSService] handleError called with:', error)
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new Error('Timeout: Verifique sua conexão com a internet')
      }

      if (error.response) {
        const status = error.response.status
        const data = error.response.data
        
        console.log(`[OTSService] Error response - Status: ${status}, Data:`, data)

        switch (status) {
          case 400:
            if (data?.message && (data.message.includes('passphrase') || data.message.includes('password'))) {
              return new Error('Senha incorreta ou obrigatória')
            }
            return new Error(data?.message || 'Dados inválidos fornecidos')
          case 401:
            return new Error('Não autorizado: Verifique suas credenciais')
          case 403:
            return new Error('Acesso negado')
          case 404:
            if (data?.message) {
              
              if (data.message.includes('rate limited') || data.message.includes('Cripes!')) {
                return new Error('Muitas tentativas em pouco tempo. Aguarde alguns segundos e tente novamente.')
              }

              if (data.message.includes('expired') || data.message.includes('expirado') || data.message.includes('consumed')) {
                return new Error('Segredo expirado ou já visualizado')
              }

              if (data.message.includes('viewed') || data.message.includes('visualizado') || data.message.includes('no longer available')) {
                return new Error('Segredo expirado ou já visualizado')
              }

              if (data.message.includes('Unknown secret')) {
                if (hasPassphrase) {
                  return new Error('Senha inválida, segredo expirado ou já visualizado')
                } else {
                  return new Error('Este segredo requer uma senha para ser acessado')
                }
              }

              if (data.message.includes('passphrase') || data.message.includes('password') || 
                  data.message.includes('Wrong')) {
                if (hasPassphrase) {
                  return new Error('Senha inválida, segredo expirado ou já visualizado')
                } else {
                  return new Error('Este segredo requer uma senha para ser acessado')
                }
              }
              
              if (data.message.length > 10) {
                return new Error(data.message)
              }
            }
            return new Error('Segredo expirado ou já visualizado')
          case 429:
            return new Error('Muitas tentativas: Tente novamente em alguns minutos')
          case 500:
            console.error('[OTSService] Server error 500 - Data:', data)
            return new Error(`Erro interno do servidor: ${data?.message || 'Tente novamente mais tarde'}`)
          case 502:
            return new Error('Backend indisponível: Verifique se o serviço está funcionando')
          case 503:
            return new Error('Serviço temporariamente indisponível')
          default:
            return new Error(data?.message || `Erro HTTP ${status}`)
        }
      }

      if (error.request) {
        console.error('[OTSService] No response received:', error.request)
        return new Error('Erro de conexão: Verifique se o backend está rodando e tente novamente')
      }
    }

    return error instanceof Error 
      ? error 
      : new Error('Erro desconhecido ocorreu')
  }
} 