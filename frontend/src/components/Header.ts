export class Header {
  private getIconPath(): string {
    return new URL('../styles/icon.png', import.meta.url).href
  }

  public render(): string {
    return `
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo and Title -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-red-500 via-red-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <div class="w-7 h-7 bg-white" style="mask: url('${this.getIconPath()}') no-repeat center; mask-size: contain; -webkit-mask: url('${this.getIconPath()}') no-repeat center; -webkit-mask-size: contain;"></div>
              </div>
              
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">ID Security PSW</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Compartilhamento seguro de segredos</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <button
                type="button"
                class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                data-action="toggle-theme"
                title="Alternar tema"
                aria-label="Alternar tema"
              >
                <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path class="pointer-events-none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    `
  }
} 