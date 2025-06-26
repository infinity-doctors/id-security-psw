import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import { resolve } from 'path'

export default defineConfig({
  plugins: [WindiCSS()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/services': resolve(__dirname, './src/services'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7143',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error, falling back to mock responses...')
            const url = req.url || ''

            if (url.includes('/v1/secret/')) {
              const secretKey = url.split('/').pop()

              if (secretKey?.startsWith('expired')) {
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    message: 'Secret not found. Either expired or consumed.',
                    error: 'expired',
                  })
                )
                return
              }

              if (secretKey?.startsWith('viewed')) {
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    message: 'Secret has been viewed and is no longer available.',
                    error: 'viewed',
                  })
                )
                return
              }

              if (secretKey?.startsWith('needspass')) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    message: 'Passphrase required to view this secret.',
                    error: 'passphrase_required',
                  })
                )
                return
              }

              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  message: 'Backend service unavailable',
                  error: 'backend_down',
                })
              )
            }
          })
        },
      },
    },
  },
})
