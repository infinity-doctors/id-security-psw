export type Theme = 'light' | 'dark'

export class ThemeManager {
  private static STORAGE_KEY = 'id-security-theme'
  private static currentTheme: Theme = 'light'

  /**
   * @description Initialize theme manager and apply saved theme
   * @returns void
   * @throws An error if the saved theme is not found
   * @throws An error if the system prefers dark mode is not found
   * @throws An error if the current theme is not found
   */
  public static init(): void {
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
    
    setTimeout(() => this.updateThemeIcon(), 100)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.currentTheme = e.matches ? 'dark' : 'light'
        this.applyTheme(this.currentTheme)
        this.updateThemeIcon()
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
    this.updateThemeIcon()
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
    this.updateThemeIcon()
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
   * @description Update theme toggle icon
   * @returns void
   * @throws An error if the theme button is not found
   * @throws An error if the icon is not found
   */
  private static updateThemeIcon(): void {
    const themeButton = document.querySelector('[data-action="toggle-theme"]')
    const icon = themeButton?.querySelector('svg')
    
    if (icon && themeButton) {
      if (this.currentTheme === 'dark') {
        icon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        `
        themeButton.setAttribute('title', 'Modo claro')
      } else {
        icon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        `
        themeButton.setAttribute('title', 'Modo escuro')
      }
    }
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
} 