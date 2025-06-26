import './styles/main.css'
import 'virtual:windi.css'
import { App } from './components/App'
import { Router } from './utils/Router'

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app')
  
  if (!appContainer) {
    throw new Error('App container not found')
  }

  const currentRoute = Router.parseRoute()
  
  const app = new App(appContainer)
  app.init(currentRoute)

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service Worker registration failed:', error)
    })
  }
}) 