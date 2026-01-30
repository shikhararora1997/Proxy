import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Handle iOS virtual keyboard - keep viewport stable
if (window.visualViewport) {
  const handleViewportResize = () => {
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.visualViewport.height}px`
    )
  }
  window.visualViewport.addEventListener('resize', handleViewportResize)
  handleViewportResize()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
