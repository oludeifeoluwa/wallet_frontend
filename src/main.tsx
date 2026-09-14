import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import DashboardApp from './dashboard/DashboardApp.tsx'

const isDashboard = window.location.pathname.startsWith('/dashboard')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDashboard ? <DashboardApp /> : <App />}
  </StrictMode>,
)
