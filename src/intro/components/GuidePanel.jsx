import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { driver } from '../core/driver';
import '../styles/guide-panel.css';

// 本地存储键名
const PANEL_VISIBLE_KEY = 'intro_panel_visible';
const STEP_RECORD_KEY = 'intro_step_record';

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
    try {
      const record = localStorage.getItem(PANEL_VISIBLE_KEY);
      return record ? JSON.parse(record).isVisible : showOnStart;
    } catch {
      return showOnStart;
    }
  });

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

    // 使用恢复的步骤索引开始引导，实现断点再引导功能
    setTimeout(() => {
      guideDriver.drive(currentStepIndex);
    }, 100);
  };

  const showPanel = () => {
    setIsVisible(true);
    try {
      localStorage.setItem(PANEL_VISIBLE_KEY, JSON.stringify({
        isVisible: true,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save panel visible state:', error);
    }
  };

  const hidePanel = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(PANEL_VISIBLE_KEY, JSON.stringify({
        isVisible: false,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save panel visible state:', error);
    }
  };

  const resetGuide = () => {
    setIsVisible(true);
    try {
      localStorage.setItem(PANEL_VISIBLE_KEY, JSON.stringify({
        isVisible: true,
        timestamp: Date.now()
      }));
      // 清除步骤记录
      localStorage.removeItem(STEP_RECORD_KEY);
      localStorage.removeItem('intro_guide_state');
      
      // 重置完成后刷新页面
      console.log('[GuidePanel] 重置完成，刷新页面');
      window.location.reload();
    } catch (error) {
      console.warn('Failed to reset guide state:', error);
    }
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