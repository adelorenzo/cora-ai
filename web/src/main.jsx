import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { PersonaProvider } from './contexts/PersonaContext'
import './index.css'
import './styles/themes.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <PersonaProvider>
      <App />
    </PersonaProvider>
  </ThemeProvider>
)