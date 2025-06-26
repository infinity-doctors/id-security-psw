export interface Route {
  type: 'home' | 'secret' | 'notfound'
  params?: {
    secretKey?: string
    passphrase?: string
  }
}

export class Router {
  /**
   * @description Parse the current URL and return route information
   * @returns The route information
   * @throws An error if the route is not found
   */
  public static parseRoute(): Route {
    const path = window.location.pathname
    const searchParams = new URLSearchParams(window.location.search)

    if (path === '/' || path === '') {
      return { type: 'home' }
    }

    const secretMatch = path.match(/^\/secret\/([a-zA-Z0-9]+)$/)
    if (secretMatch) {
      const secretKey = secretMatch[1]
      const passphrase = searchParams.get('p') || undefined
      
      return {
        type: 'secret',
        params: {
          secretKey,
          passphrase
        }
      }
    }

    return { type: 'notfound' }
  }

  /**
   * @description Navigate to a new route
   * @param path - The path to navigate to
   * @returns The route information
   * @throws An error if the route is not found
   */
  public static navigate(path: string): void {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  /**
   * @description Generate URL for a secret
   * @param secretKey - The secret key to generate the URL for
   * @param passphrase - The passphrase to generate the URL for
   * @returns The shareable URL for the secret
   * @throws An error if the secret key is not found
   * @throws An error if the passphrase is not found
   */
  public static generateSecretUrl(secretKey: string, passphrase?: string): string {
    let url = `/secret/${secretKey}`
    if (passphrase) {
      url += `?p=${encodeURIComponent(passphrase)}`
    }
    return url
  }

  /**
   * @description Check if a secret key is valid format
   * @param key - The secret key to check
   * @returns The boolean value indicating if the secret key is valid
   * @throws An error if the secret key is not found
   * @throws An error if the secret key is not found
   */
  public static isValidSecretKey(key: string): boolean {
    return /^[a-zA-Z0-9]{20,32}$/.test(key)
  }

  /**
   * @description Go back to home
   * @returns The route information
   * @throws An error if the route is not found
   */
  public static goHome(): void {
    Router.navigate('/')
  }
} 