import { useState } from 'react'
import { Button } from '@douyinfe/semi-ui'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="container">
        <h1>Semi-UI 组件示例</h1>
        
        <Button 
          type="primary" 
          onClick={() => setCount(count + 1)}
          style={{ margin: '20px' }}
        >
          点击计数: {count}
        </Button>
      </div>
    </>
  )
}

export default App
