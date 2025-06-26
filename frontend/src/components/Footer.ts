export class Footer {
  public render(): string {
    const currentYear = new Date().getFullYear()
    
    return `
      <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <!-- Company Info -->
            <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <span>© ${currentYear} ID Security Password</span>
              <span class="hidden md:inline">•</span>
              <span class="hidden md:inline">Infinity Doctors, Inc.</span>
            </div>

            <!-- Links and Info -->
            <div class="flex items-center space-x-6 text-sm">
              <!-- Security Badge -->
              <div class="flex items-center space-x-2 text-success-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span class="font-medium">Criptografia E2E</span>
              </div>

              <!-- Version Info -->
              <div class="text-gray-400 dark:text-gray-500">
                <span class="hidden sm:inline">v1.0.0</span>
              </div>
            </div>
          </div>

          <!-- Security Notice (Mobile) -->
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 md:hidden">
            <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
              <div class="flex items-center justify-center space-x-1 mb-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <span>Baseado em One-Time Secret</span>
              </div>
              <p>Todos os dados são criptografados e excluídos após visualização</p>
            </div>
          </div>
        </div>
      </footer>
    `
  }
} 