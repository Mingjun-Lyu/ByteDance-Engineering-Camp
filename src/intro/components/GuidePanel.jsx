import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { driver } from '../core/driver';
import { useRouteMatching } from '../hooks/useRouteMatching';
import '../styles/guide-panel.css';

// 本地存储键名
const PANEL_VISIBLE_KEY = 'intro_panel_visible';
const STEP_RECORD_KEY = 'intro_step_record';
const GUIDE_STATE_KEY = 'intro_guide_state';

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

  const handleStepChange = React.useCallback((newStepIndex, guideDriver) => {
    if (onStepChange) {
      onStepChange(newStepIndex);
    }
    
    const steps = guideConfig.steps || [];
    if (newStepIndex >= 0 && newStepIndex < steps.length) {
      guideDriver.drive(newStepIndex);
    } else {
      guideDriver.destroy();
    }
  }, [guideConfig.steps, onStepChange]);

  const location = useLocation();
  const { isRouteMatch } = useRouteMatching();

  const startGuide = React.useCallback((isCrossPage = false) => {
    // 检查当前路由是否在当前步骤的路由
    const currentStep = guideConfig.steps[currentStepIndex];
    if (currentStep && currentStep.route) {
      const isMatch = isRouteMatch(currentStep.route, location.pathname);
      if (!isMatch) {
        console.log('[GuidePanel] 路由不匹配，跳转到当前步骤的路由:', currentStep.route);
        // 使用window.location.href进行完整页面跳转（解决路由隔离问题）
        window.location.href = currentStep.route;
        return;
      }
    }
    
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
        const steps = guideConfig.steps || [];
        
        // 检查是否已经是最后一步
        if (nextIndex >= steps.length) {
          console.log('[GuidePanel] 引导已完成，销毁引导');
          guideDriver.destroy();
          return;
        }
        
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

    // 跨页面引导恢复时，增加延迟确保DOM完全渲染
    const startGuideWithDelay = () => {
      const targetElement = document.querySelector(currentStep?.element || '');
      
      if (isCrossPage && !targetElement) {
        // 如果是跨页面且目标元素不存在，等待更长时间
        console.log('[GuidePanel] 跨页面引导：目标元素未找到，等待DOM渲染...');
        setTimeout(startGuideWithDelay, 200);
        return;
      }
      
      if (targetElement) {
        console.log('[GuidePanel] 目标元素已找到，开始引导');
        guideDriver.drive(currentStepIndex);
      } else {
        console.warn('[GuidePanel] 目标元素未找到，但仍尝试开始引导');
        guideDriver.drive(currentStepIndex);
      }
    };

    // 跨页面引导使用更长延迟，普通引导使用较短延迟
    const delay = isCrossPage ? 500 : 100;
    console.log(`[GuidePanel] ${isCrossPage ? '跨页面' : '普通'}引导，延迟${delay}ms开始`);
    setTimeout(startGuideWithDelay, delay);
  }, [guideConfig, currentStepIndex, isRouteMatch, location.pathname, setIsVisible, onGuideStart, onGuideComplete, onStepChange, handleStepChange]);

  // 检查是否需要自动恢复跨页面引导
  React.useEffect(() => {
    try {
      // 获取引导状态
      const guideState = localStorage.getItem(GUIDE_STATE_KEY);
      const panelVisible = localStorage.getItem(PANEL_VISIBLE_KEY);
      
      if (guideState && panelVisible) {
        const guideStateParsed = JSON.parse(guideState);
        const panelVisibleParsed = JSON.parse(panelVisible);
        
        // 检查四个条件是否同时满足
        const isGuideActive = guideStateParsed.isGuideActive === true;
        const isVisible = panelVisibleParsed.isVisible === true;
        const currentStep = guideStateParsed.currentStepIndex || 0;
        
        // 检查当前步骤是否大于0
        const stepGreaterThanZero = currentStep > 0;
        
        // 检查当前步骤与上一步骤的route是否不同（用于下一步换页）
        let routeDifferentPrev = false;
        if (stepGreaterThanZero && guideConfig.steps && guideConfig.steps.length > currentStep) {
          const currentStepRoute = guideConfig.steps[currentStep]?.route || '';
          const previousStepRoute = guideConfig.steps[currentStep - 1]?.route || '';
          routeDifferentPrev = currentStepRoute !== previousStepRoute;
        }
        
        // 检查当前步骤与下一步骤的route是否不同（用于上一步换页）
        let routeDifferentNext = false;
        if (guideConfig.steps && guideConfig.steps.length > currentStep + 1) {
          const currentStepRoute = guideConfig.steps[currentStep]?.route || '';
          const nextStepRoute = guideConfig.steps[currentStep + 1]?.route || '';
          routeDifferentNext = currentStepRoute !== nextStepRoute;
        }
        
        // 只要有一个路由不同就满足条件
        const routeDifferent = routeDifferentPrev || routeDifferentNext;
        
        console.log('[GuidePanel] 跨页面引导恢复检查:', {
          isGuideActive,
          isVisible,
          currentStep,
          stepGreaterThanZero,
          routeDifferentPrev,
          routeDifferentNext,
          routeDifferent,
          allConditionsMet: isGuideActive && isVisible && stepGreaterThanZero && routeDifferent
        });
        
        // 四个条件同时满足时，自动开始引导
        if (isGuideActive && isVisible && stepGreaterThanZero && routeDifferent) {
          console.log('[GuidePanel] 检测到跨页面引导恢复条件，自动开始引导');
          startGuide(true); // 传递true表示是跨页面引导
        }
      }
    } catch (error) {
      console.warn('[GuidePanel] 跨页面引导恢复检查失败:', error);
    }
  }, [guideConfig.steps, startGuide]); // 依赖steps数组和startGuide函数

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
          {currentStepIndex === 0 ? (
            <button 
              className="guide-start-btn" 
              onClick={startGuide}
            >
              开始引导
            </button>
          ) : (
            <button 
              className="guide-continue-btn" 
              onClick={startGuide}
            >
              继续引导
            </button>
          )}
          
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