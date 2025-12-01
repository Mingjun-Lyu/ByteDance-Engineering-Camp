import { useEffect, useRef } from 'react';
import { OnboardingManager } from '../core/OnboardingManager.js';

/**
 * DriverJS UI整合测试组件
 * 用于测试driverjs-adapter与OnboardingManager的整合功能
 */
export function DriverJSTest() {
  const containerRef = useRef(null);
  const managerRef = useRef(null);

  useEffect(() => {
    // 初始化OnboardingManager
    managerRef.current = new OnboardingManager({
      debug: true,
      ui: {
        animate: true,
        overlayOpacity: 0.8,
        stagePadding: 15,
        showProgress: true
      }
    });

    // 注册一个测试引导流程
    const testGuideId = 'driverjs-integration-test';
    managerRef.current.registerGuide(testGuideId, {
      name: 'DriverJS整合测试',
      steps: [
        {
          id: 'step-1',
          selector: '#test-btn-1',
          title: '步骤1：这是第一个按钮',
          description: 'DriverJS UI成功高亮显示了第一个目标元素，这是一个测试按钮。',
          side: 'bottom'
        },
        {
          id: 'step-2',
          selector: '#test-btn-2',
          title: '步骤2：这是第二个按钮',
          description: 'DriverJS UI成功高亮显示了第二个目标元素，包含了遮罩层和弹出提示。',
          side: 'right'
        },
        {
          id: 'step-3',
          selector: '#test-input',
          title: '步骤3：这是输入框',
          description: 'DriverJS UI支持高亮各种类型的DOM元素，包括表单输入框。',
          side: 'top',
          disableInteraction: true
        },
        {
          id: 'step-4',
          selector: '.test-container',
          title: '步骤4：这是容器元素',
          description: '测试完成！DriverJS UI与OnboardingManager的整合功能正常工作。',
          side: 'bottom',
          showButtons: ['next', 'close']
        }
      ]
    });

    // 监听事件以便调试
    managerRef.current.on('guideStarted', (data) => {
      console.log('引导开始:', data);
    });

    managerRef.current.on('stepExecuted', (data) => {
      console.log('步骤执行:', data);
    });

    managerRef.current.on('guideCompleted', (data) => {
      console.log('引导完成:', data);
      alert('DriverJS整合测试完成！');
    });

    managerRef.current.on('error', (data) => {
      console.error('错误:', data);
      alert(`测试过程中出现错误: ${data.message}`);
    });

    return () => {
      // 清理资源
      managerRef.current?.destroy && managerRef.current.destroy();
    };
  }, []);

  const startTest = async () => {
    try {
      // 重置之前的状态
      await managerRef.current.resetGuide('driverjs-integration-test');
      // 开始测试引导
      await managerRef.current.startGuide('driverjs-integration-test');
    } catch (error) {
      console.error('测试启动失败:', error);
      alert('测试启动失败，请检查控制台错误信息');
    }
  };

  return (
    <div ref={containerRef} className="test-container" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px' }}>
      <h2>DriverJS UI整合测试</h2>
      <p>此组件用于测试driverjs-adapter与OnboardingManager的整合功能。点击下方按钮开始测试。</p>
      
      <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <button 
          id="test-btn-1" 
          onClick={startTest} 
          style={{ padding: '10px 20px', margin: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          开始DriverJS测试
        </button>
        
        <button 
          id="test-btn-2" 
          style={{ padding: '10px 20px', margin: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          测试按钮2
        </button>
        
        <input 
          id="test-input" 
          type="text" 
          placeholder="测试输入框" 
          style={{ padding: '10px', margin: '10px', fontSize: '16px', width: '200px' }}
        />
      </div>
      
      <div style={{ marginTop: '20px', color: '#666' }}>
        <h3>测试说明</h3>
        <ul>
          <li>点击"开始DriverJS测试"按钮启动测试流程</li>
          <li>系统会依次高亮显示页面上的各个元素</li>
          <li>使用弹出框中的导航按钮在步骤间切换</li>
          <li>完成所有步骤后，会收到成功提示</li>
          <li>测试过程中的状态会输出到浏览器控制台</li>
        </ul>
      </div>
    </div>
  );
}

export default DriverJSTest;