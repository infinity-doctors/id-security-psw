import './styles/main.css'
import 'virtual:windi.css'
import { App } from './components/App'

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app')
  
  if (!appContainer) {
    throw new Error('App container not found')
  }

  // Initialize the main application
  const app = new App(appContainer)
  app.init()

  // Register service worker for offline capabilities (optional)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service Worker registration failed:', error)
    })
  }
}) 