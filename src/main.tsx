import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './hooks/useTheme'
import App from './App'
import '../global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
)
