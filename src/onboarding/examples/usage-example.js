import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding.js';
import { basicGuideConfig } from './basic-guide.js';

/**
 * 使用示例组件
 * 展示如何在React组件中集成新手引导系统
 */
export function OnboardingExample() {
  const {
    isActive,
    currentGuide,
    currentStep,
    registerGuide,
    startGuide,
    completeStep,
    skipGuide
    // isGuideActive,  // 注释掉未使用的变量
    // isStepActive    // 注释掉未使用的变量
  } = useOnboarding({
    debug: true,
    autoSave: true
  });
  
  // 注册引导配置
  React.useEffect(() => {
    registerGuide('welcome-guide', basicGuideConfig);
  }, [registerGuide]);
  
  // 自动开始引导（示例）
  React.useEffect(() => {
    const timer = setTimeout(() => {
      startGuide('welcome-guide');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [startGuide]);
  
  // 渲染引导UI
  const renderOnboardingUI = () => {
    if (!isActive) return null;
    
    const guide = basicGuideConfig;
    const step = guide.steps[currentStep];
    
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-tooltip" style={getTooltipPosition(step.position)}>
          <div className="tooltip-header">
            <h3>{step.title}</h3>
            <button 
              className="close-button"
              onClick={() => skipGuide('welcome-guide')}
            >
              ×
            </button>
          </div>
          <div className="tooltip-content">
            <p>{step.content}</p>
          </div>
          <div className="tooltip-footer">
            <span className="step-progress">
              {currentStep + 1} / {guide.steps.length}
            </span>
            <div className="tooltip-actions">
              <button 
                className="secondary-button"
                onClick={() => skipGuide('welcome-guide')}
              >
                跳过
              </button>
              <button 
                className="primary-button"
                onClick={completeStep}
              >
                {currentStep === guide.steps.length - 1 ? '完成' : '下一步'}
              </button>
            </div>
          </div>
        </div>
        
        {/* 高亮目标元素 */}
        {step.target && (
          <div 
            className="target-highlight"
            style={getHighlightStyle(step.target)}
          />
        )}
      </div>
    );
  };
  
  // 工具函数
  const getTooltipPosition = (position) => {
    const positions = {
      top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
      bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
      left: { right: '100%', top: '50%', transform: 'translateY(-50%)' },
      right: { left: '100%', top: '50%', transform: 'translateY(-50%)' },
      center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    };
    
    return positions[position] || positions.center;
  };
  
  const getHighlightStyle = () => {
    // 简化版高亮样式，实际实现需要元素定位
    return {
      position: 'absolute',
      border: '2px solid #007bff',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: 9998
    };
  };
  
  return (
    <div className="onboarding-container">
      {/* 你的应用内容 */}
      <div className="app-content">
        <h1>我的应用</h1>
        <p>这里是应用的主要内容...</p>
      </div>
      
      {/* 引导UI */}
      {renderOnboardingUI()}
      
      {/* 调试信息 */}
      {typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost' && (
        <div className="debug-info">
          <h4>引导状态调试</h4>
          <p>激活状态: {isActive ? '是' : '否'}</p>
          <p>当前引导: {currentGuide || '无'}</p>
          <p>当前步骤: {currentStep !== null ? currentStep + 1 : '无'}</p>
          <button onClick={() => startGuide('welcome-guide')}>
            开始引导
          </button>
          <button onClick={() => skipGuide('welcome-guide')}>
            跳过引导
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 高阶组件示例
 * 使用HOC方式集成引导功能
 */
export function withOnboarding(WrappedComponent, guideConfig) {
  return function OnboardingWrapper(props) {
    const onboarding = useOnboarding();
    
    React.useEffect(() => {
      if (guideConfig) {
        onboarding.registerGuide(guideConfig.id, guideConfig);
      }
    }, [onboarding]);  // 移除guideConfig依赖
    
    return (
      <WrappedComponent 
        {...props} 
        onboarding={onboarding}
      />
    );
  };
}

/**
 * 条件引导示例
 * 根据条件动态显示引导
 */
export function ConditionalOnboarding({ children, condition }) {
  const { startGuide, isGuideActive } = useOnboarding();
  
  React.useEffect(() => {
    if (condition && !isGuideActive('conditional-guide')) {
      startGuide('conditional-guide');
    }
  }, [condition, startGuide, isGuideActive]);
  
  return children;
}