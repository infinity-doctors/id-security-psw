import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    WindiCSS()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/services': resolve(__dirname, './src/services'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7143',
        changeOrigin: true,
        secure: false
      }
    }
  }
}) 