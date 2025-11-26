import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 引入Semi-UI样式
import '@douyinfe/semi-ui/dist/css/semi.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
