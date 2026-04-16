import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/tokens.css'

// Clear localStorage on fresh page load (cache clear / new session)
// sessionStorage survives normal refresh but is wiped on tab close or cache clear
const SESSION_KEY = 'lgq_session'
if (!sessionStorage.getItem(SESSION_KEY)) {
  // New session — clear any stale localStorage
  const keys = Object.keys(localStorage).filter(k => k.startsWith('lgq_'))
  keys.forEach(k => localStorage.removeItem(k))
  sessionStorage.setItem(SESSION_KEY, '1')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
