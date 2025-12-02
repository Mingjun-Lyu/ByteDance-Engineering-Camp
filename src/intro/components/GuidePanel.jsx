import React, { useState, useEffect } from 'react';
import { driver } from '../core/driver';
import { clearStepRecord } from '../utils/state';
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
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setIsVisible(showOnStart);
  }, [showOnStart]);

  const handleStepChange = (newStepIndex, guideDriver) => {
    setCurrentStep(newStepIndex);
    
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
  };

  const hidePanel = () => {
    setIsVisible(false);
  };

  const resetGuide = () => {
    setCurrentStep(0);
    setIsVisible(true);
    clearStepRecord();
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
              第 {currentStep + 1} 步（共 {guideConfig.steps.length} 步）
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

export default GuidePanel;