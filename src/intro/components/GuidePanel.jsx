import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { driver } from '../core/driver';
import { clearStepRecord, savePanelVisible, getPanelVisible, clearPanelVisible } from '../utils/state';
import '../styles/guide-panel.css';

const GuidePanel = ({ 
  position = 'top-center',
  showOnStart = true,
  onGuideStart,
  onGuideComplete,
  onStepChange,
  currentStepIndex,
  guideConfig = {
    title: '新手引导',
    description: '欢迎使用本系统，让我们开始引导吧！',
    steps: [],
    config: {}
  }
}) => {
  // 确保 currentStepIndex 被正确传入
  if (currentStepIndex === undefined) {
    console.warn('GuidePanel: currentStepIndex is required but not provided');
  }
  
  // 从本地存储恢复面板显示状态，如果没有则使用 showOnStart
  const [isVisible, setIsVisible] = useState(() => {
    const savedVisible = getPanelVisible();
    return savedVisible ? savedVisible.isVisible : showOnStart;
  }); // 空依赖数组，只在挂载时执行一次

  const handleStepChange = (newStepIndex, guideDriver) => {
    if (onStepChange) {
      onStepChange(newStepIndex);
    }
    
    const steps = guideConfig.steps || [];
    if (newStepIndex >= 0 && newStepIndex < steps.length) {
      guideDriver.drive(newStepIndex);
    } else {
      guideDriver.destroy();
    }
  };

  const startGuide = () => {
    setIsVisible(false);
    
    if (onGuideStart) {
      onGuideStart();
    }

    const guideDriver = driver({
      ...guideConfig.config,
      steps: guideConfig.steps,
      onNextClick: (element, step, context) => {
        const currentIndex = context.state.activeIndex || 0;
        const nextIndex = currentIndex + 1;
        handleStepChange(nextIndex, guideDriver);
      },
      onPrevClick: (element, step, context) => {
        const currentIndex = context.state.activeIndex || 0;
        const prevIndex = currentIndex - 1;
        handleStepChange(prevIndex, guideDriver);
      },
      onDestroyed: () => {
        if (onGuideComplete) {
          onGuideComplete();
        }
      }
    });

    setTimeout(() => {
      guideDriver.drive(0);
    }, 100);
  };

  const showPanel = () => {
    setIsVisible(true);
    savePanelVisible(true);
  };

  const hidePanel = () => {
    setIsVisible(false);
    savePanelVisible(false);
  };

  const resetGuide = () => {
    setIsVisible(true);
    savePanelVisible(true);
    clearStepRecord();
    clearPanelVisible(); // 清除面板显示状态记录
  };

  if (!isVisible) {
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
          
          <div className="guide-current-step">
            <h4>当前进度：</h4>
            <p className="step-info">
              第 {currentStepIndex + 1} 步（共 {guideConfig.steps.length} 步）
            </p>
          </div>
        </div>
        
        <div className="guide-footer">
          <button 
            className="guide-start-btn" 
            onClick={startGuide}
          >
            开始引导
          </button>
          
 
          <button 
            className="guide-skip-btn" 
            onClick={resetGuide}
          >
            重置
          </button>

          
        </div>
      </div>
    </div>
  );
};

GuidePanel.propTypes = {
  position: PropTypes.oneOf([
    'top-center',
    'top-left',
    'top-right',
    'bottom-center',
    'bottom-left',
    'bottom-right',
    'left-center',
    'right-center'
  ]),
  showOnStart: PropTypes.bool,
  onGuideStart: PropTypes.func,
  onGuideComplete: PropTypes.func,
  onStepChange: PropTypes.func,
  currentStepIndex: PropTypes.number.isRequired,
  guideConfig: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    steps: PropTypes.array,
    config: PropTypes.object
  })
};

export default GuidePanel;