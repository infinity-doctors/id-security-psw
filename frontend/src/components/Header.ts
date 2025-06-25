export class Header {
  public render(): string {
    return `
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo and Title -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-security-500 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              
              <div>
                <h1 class="text-xl font-bold text-gray-900">ID Security PSW</h1>
                <p class="text-xs text-gray-500 hidden sm:block">Compartilhamento Seguro Corporativo</p>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="flex items-center space-x-4">
              <!-- Connection Status -->
              <div class="hidden md:flex items-center space-x-2">
                <div class="w-2 h-2 bg-success-500 rounded-full animate-pulse-subtle"></div>
                <span class="text-sm text-gray-600">Online</span>
              </div>

              <!-- Help Button -->
              <button
                type="button"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                data-action="show-help"
                title="Ajuda"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>

              <!-- Theme Toggle -->
              <button
                type="button"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                data-action="toggle-theme"
                title="Alternar tema"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    `
  }
} 