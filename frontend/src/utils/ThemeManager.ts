export type Theme = 'light' | 'dark'

export class ThemeManager {
  private static STORAGE_KEY = 'id-security-theme'
  private static currentTheme: Theme = 'light'
  private static isInitialized = false
  private static iconUpdateRetries = 0
  private static maxRetries = 3

  /**
   * @description Initialize theme manager and apply saved theme
   * @returns void
   * @throws An error if the saved theme is not found
   */
  public static init(): void {
    if (this.isInitialized) {
      console.log('ThemeManager already initialized, just updating icon...')
      this.scheduleIconUpdate()
      return
    }

    const savedTheme = localStorage.getItem(this.STORAGE_KEY) as Theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme = savedTheme
    } else if (systemPrefersDark) {
      this.currentTheme = 'dark'
    } else {
      this.currentTheme = 'light'
    }
    
    console.log('ThemeManager init:', { savedTheme, systemPrefersDark, currentTheme: this.currentTheme })
    this.applyTheme(this.currentTheme)
    
    this.isInitialized = true
    
    this.scheduleIconUpdate()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.currentTheme = e.matches ? 'dark' : 'light'
        this.applyTheme(this.currentTheme)
        this.forceIconUpdate()
      }
    })
  }

  /**
   * @description Toggle between light and dark themes
   * @returns void
   * @throws An error if the old theme is not found
   * @throws An error if the current theme is not found
   */
  public static toggle(): void {
    const oldTheme = this.currentTheme
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    console.log(`Theme toggle: ${oldTheme} → ${this.currentTheme}`)
    this.applyTheme(this.currentTheme)
    localStorage.setItem(this.STORAGE_KEY, this.currentTheme)
    
    this.forceIconUpdate()
  }

  /**
   * @description Set specific theme
   * @param theme - The theme to set
   * @returns void
   * @throws An error if the theme is not found
   */
  public static setTheme(theme: Theme): void {
    this.currentTheme = theme
    this.applyTheme(theme)
    localStorage.setItem(this.STORAGE_KEY, theme)
    this.forceIconUpdate()
  }

  /**
   * @description Get current theme
   * @returns The current theme
   * @throws An error if the current theme is not found
   */
  public static getCurrentTheme(): Theme {
    return this.currentTheme
  }

  /**
   * @description Apply theme to document
   * @param theme - The theme to apply
   * @returns void
   * @throws An error if the theme is not found
   */
  private static applyTheme(theme: Theme): void {
    const root = document.documentElement
    
    console.log(`Applying theme: ${theme}`)
    console.log(`Root element classes before:`, root.classList.toString())
    
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    console.log(`Root element classes after:`, root.classList.toString())

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff')
    }
  }

  /**
   * @description Schedule icon update with proper timing
   * @returns void
   */
  private static scheduleIconUpdate(): void {
    // Multiple attempts with increasing delays
    setTimeout(() => this.updateThemeIcon(), 50)
    setTimeout(() => this.updateThemeIcon(), 150)
    setTimeout(() => this.updateThemeIcon(), 300)
  }

  /**
   * @description Force icon update with retry logic
   * @returns void
   */
  private static forceIconUpdate(): void {
    this.iconUpdateRetries = 0
    this.updateThemeIconWithRetry()
  }

  /**
   * @description Update theme icon with retry mechanism
   * @returns boolean indicating success of the update
   */
  private static updateThemeIconWithRetry(): boolean {
    const success = this.updateThemeIcon()
    
    if (!success && this.iconUpdateRetries < this.maxRetries) {
      this.iconUpdateRetries++
      console.log(`Icon update failed, retrying... (${this.iconUpdateRetries}/${this.maxRetries})`)
      setTimeout(() => this.updateThemeIconWithRetry(), 100 * this.iconUpdateRetries)
    } else if (success) {
      this.iconUpdateRetries = 0
      console.log('Icon updated successfully!')
    } else {
      console.warn('Failed to update theme icon after max retries')
    }
    return success
  }

  /**
   * @description Update theme toggle icon
   * @returns boolean indicating success of the update
   */
  private static updateThemeIcon(): boolean {
    const themeButtons = document.querySelectorAll('[data-action="toggle-theme"]')
    
    if (themeButtons.length === 0) {
      console.log('No theme toggle buttons found')
      return false
    }

    let success = false
    
    themeButtons.forEach((themeButton, index) => {
      const icon = themeButton.querySelector('svg')
      
      if (icon && themeButton) {
        console.log(`Updating theme icon ${index + 1}/${themeButtons.length} to:`, this.currentTheme)
        
        if (this.currentTheme === 'dark') {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          `
          themeButton.setAttribute('title', 'Alternar para modo claro')
          themeButton.setAttribute('aria-label', 'Alternar para modo claro')
        } else {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          `
          themeButton.setAttribute('title', 'Alternar para modo escuro')
          themeButton.setAttribute('aria-label', 'Alternar para modo escuro')
        }
        success = true
      } else {
        console.log(`Icon or button not found for button ${index + 1}`)
      }
    })

    return success
  }

  /**
   * @description Check if dark mode is enabled
   * @returns The boolean value indicating if dark mode is enabled
   * @throws An error if the current theme is not found
   */
  public static isDark(): boolean {
    return this.currentTheme === 'dark'
  }

  /**
   * @description Check if light mode is enabled
   * @returns The boolean value indicating if light mode is enabled
   * @throws An error if the current theme is not found
   */
  public static isLight(): boolean {
    return this.currentTheme === 'light'
  }

  /**
   * @description Refresh theme icon (useful after DOM changes)
   * @returns void
   */
  public static refreshIcon(): void {
    console.log('Manually refreshing theme icon...')
    this.scheduleIconUpdate()
  }
} 