import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './output.css'
import App from './App.jsx'

// Initialize debug logging tools (exposes window.exportLogs, window.downloadLogs)
import './utils/logExporter'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
