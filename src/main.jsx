import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 引入Bootstrap样式
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
