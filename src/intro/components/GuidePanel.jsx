import React, { useState, useEffect } from 'react';
import { driver } from '../core/driver';
import { getState, resetState, setState, clearStepRecord } from '../utils/state';
import '../styles/guide-panel.css';

const GuidePanel = ({ 
  position = 'top-center',
  showOnStart = true,
  onGuideStart,
  onGuideComplete,
  onStepChange,
  guideConfig = {
    title: '新手引导',
    description: '欢迎使用本系统，让我们开始引导吧！',
    steps: [],
    config: {}
  }
}) => {
  const [isVisible, setIsVisible] = useState(showOnStart);
  const [hasCompleted, setHasCompleted] = useState(false);

  // 移除localStorage检查，使面板始终可见
  useEffect(() => {
    setIsVisible(showOnStart);
  }, [showOnStart]);

  const startGuide = () => {
    setIsVisible(false);
    
    if (onGuideStart) {
      onGuideStart();
    }

    // 配置引导
    const guideDriver = driver({
      ...guideConfig.config,
      steps: guideConfig.steps,
      onNextClick: (element, step, context) => {
        // 获取当前步骤索引
        const currentIndex = context.state.activeIndex || 0;
        const nextIndex = currentIndex + 1;
        
        // 步骤变化回调
        if (onStepChange) {
          onStepChange(nextIndex);
        }
        
        // 继续下一步
        const steps = guideConfig.steps || [];
        if (nextIndex < steps.length) {
          guideDriver.drive(nextIndex);
        } else {
          guideDriver.destroy();
        }
      },
      onPrevClick: (element, step, context) => {
        // 获取当前步骤索引
        const currentIndex = context.state.activeIndex || 0;
        const prevIndex = currentIndex - 1;
        
        // 步骤变化回调
        if (onStepChange) {
          onStepChange(prevIndex);
        }
        
        // 返回上一步
        if (prevIndex >= 0) {
          guideDriver.drive(prevIndex);
        }
      },
      onDestroyed: () => {
        // 引导完成
        setHasCompleted(true);
        if (onGuideComplete) {
          onGuideComplete();
        }
      }
    });

    // 开始引导 - 注意：drive(0)会自动检查记录的步骤并智能恢复
    setTimeout(() => {
      guideDriver.drive(0);
    }, 100);
  };

  const showPanel = () => {
    setIsVisible(true);
  };

  const hidePanel = () => {
    setIsVisible(false);
  };

  const resetGuide = () => {
    setHasCompleted(false);
    setIsVisible(true);
    // 清除步骤记录，确保重新开始从头开始
    clearStepRecord();
  };

  if (!isVisible) {
    // 始终显示小浮标用于重新打开引导面板
    return (
      <div className="guide-floating-trigger" onClick={showPanel}>
        <span>?</span>
      </div>
    );
  }

  return (
    <div className={`guide-panel guide-panel-${position}`}>
      <div className="guide-panel-content">
        <div className="guide-header">
          <h3>{guideConfig.title}</h3>
          <button className="guide-close-btn" onClick={hidePanel}>
            ×
          </button>
        </div>
        
        <div className="guide-body">
          <p>{guideConfig.description}</p>
          
          <div className="guide-steps-preview">
            <h4>引导步骤预览：</h4>
            <ul>
              {guideConfig.steps.map((step, index) => (
                <li key={index}>
                  <span className="step-number">{index + 1}</span>
                  {step.popover.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="guide-footer">
          <button 
            className="guide-start-btn" 
            onClick={startGuide}
          >
            开始引导
          </button>
          
          {hasCompleted && (
            <button 
              className="guide-reset-btn" 
              onClick={resetGuide}
            >
              重新开始
            </button>
          )}
          
          <button 
            className="guide-skip-btn" 
            onClick={hidePanel}
          >
            跳过引导
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidePanel;