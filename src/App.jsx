import { useState } from 'react'
import HelloWorld from './components/HelloWorld'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="container">
        <h1>React项目示例</h1>
        <HelloWorld />
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            计数: {count}
          </button>
          <p>点击按钮增加计数</p>
        </div>
      </div>
    </>
  )
}

export default App
