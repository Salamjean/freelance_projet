import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { setupAxiosInterceptors } from './lib/axios-config'
import App from './App.tsx'

setupAxiosInterceptors()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
