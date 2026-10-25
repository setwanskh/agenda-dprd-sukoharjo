import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { DEFAULTS, muatCache, terapkanTema } from './lib/settings'

terapkanTema((muatCache() ?? DEFAULTS).theme)

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
