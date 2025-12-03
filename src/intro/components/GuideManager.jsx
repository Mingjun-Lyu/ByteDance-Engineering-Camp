import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GuidePanel from './GuidePanel';
import homeGuideConfig from '../jsons/guide-config.json';
import { useRouteMatching } from '../hooks/useRouteMatching';
import { useRouteNavigation } from '../hooks/useRouteNavigation';

// 本地存储键名
const GUIDE_STATE_KEY = 'intro_guide_state';
const PANEL_VISIBLE_KEY = 'intro_panel_visible';

const GuideManager = ({ 
  children, 
  position = 'top-center',
  onGuideStart,
  onGuideComplete
}) => {
  // 直接从本地存储初始化状态
  const [isGuideActive, setIsGuideActive] = useState(() => {
    try {
      const saved = localStorage.getItem(GUIDE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 如果存在保存的引导状态，优先使用保存的状态
        return parsed.isGuideActive !== undefined ? parsed.isGuideActive : false;
      }
      return false;
    } catch {
      return false;
    }
  });
  
  const [guideConfig, setGuideConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(GUIDE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 如果存在保存的步骤索引，优先使用保存的状态
        return parsed.currentStepIndex !== undefined ? parsed.currentStepIndex : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });
  
  const location = useLocation();
  
  // 使用路由匹配和导航hooks
  const { isRouteMatch, buildTargetRoute } = useRouteMatching();
  const { 
    handleStepNavigation, 
  } = useRouteNavigation();

  // 保存引导状态到本地存储
  const saveCurrentState = React.useCallback(() => {
    try {
      localStorage.setItem(GUIDE_STATE_KEY, JSON.stringify({
        currentStepIndex,
        isGuideActive,
        guideConfig,
        configError,
        lastSaved: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save guide state:', error);
    }
  }, [currentStepIndex, isGuideActive, guideConfig, configError]);

  // 保存面板显示状态
  const savePanelVisible = React.useCallback((isVisible) => {
    try {
      localStorage.setItem(PANEL_VISIBLE_KEY, JSON.stringify({
        isVisible,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save panel visible state:', error);
    }
  }, []);

  // 获取当前步骤索引
  const getCurrentStepIndex = React.useCallback(() => {
    try {
      const saved = localStorage.getItem(GUIDE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 如果存在保存的步骤索引，优先使用保存的状态
        return parsed.currentStepIndex !== undefined ? parsed.currentStepIndex : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    const loadConfig = () => {
      try {
        const config = homeGuideConfig;
        if (!config || !config.title || !config.steps) {
          throw new Error('引导配置文件格式错误或缺失必要字段');
        }
        
        setGuideConfig(config);
        setConfigError(null);
      } catch (error) {
        console.warn('Failed to load guide config:', error);
        setConfigError(error.message);
        setGuideConfig(null);
      }
    };

    loadConfig();
  }, []); // 空依赖数组，只在组件挂载时执行

  // 状态变化时自动保存
  useEffect(() => {
    saveCurrentState();
  }, [saveCurrentState]);

  useEffect(() => {
    if (isGuideActive && guideConfig && guideConfig.steps && guideConfig.steps.length > 0) {
      // 获取当前步骤对应的路由
      const currentStep = guideConfig.steps[currentStepIndex];
      const currentStepRoute = currentStep?.route || '/';
      
      
      if (!isRouteMatch(currentStepRoute, location.pathname)) {
        // 使用window.location.href进行完整页面跳转（解决路由隔离问题）
        window.location.href = currentStepRoute;
      }
    }
  }, [isGuideActive, guideConfig, currentStepIndex, location.pathname, isRouteMatch]);

  const handleGuideStart = () => {
    if (configError || !guideConfig || guideConfig.steps.length === 0) {
      alert('引导配置文件缺失或格式错误，无法开始引导！\\n\\n错误信息：' + (configError || '配置文件为空或缺少步骤配置'));
      return;
    }
    
    // 恢复之前保存的步骤索引，如果没有则从0开始
    const savedStepIndex = getCurrentStepIndex();
    const validStepIndex = savedStepIndex >= 0 && savedStepIndex < guideConfig.steps.length 
      ? savedStepIndex 
      : 0;
    
    // 获取恢复步骤对应的路由
    const restoredStep = guideConfig.steps[validStepIndex];
    const restoredRoute = restoredStep ? restoredStep.route || '/' : '/';
    
    // 检查当前路由是否与恢复步骤的路由匹配
    const isCurrentRouteMatch = isRouteMatch(restoredRoute, location.pathname);
    
    // 如果不匹配，先导航到恢复步骤的路由
    if (!isCurrentRouteMatch) {
      // 使用window.location.href进行完整页面跳转（解决路由隔离问题）
      window.location.href = restoredRoute;
      
      // 延迟设置状态，确保路由跳转完成
      setTimeout(() => {
        setCurrentStepIndex(validStepIndex);
        setIsGuideActive(true);
        saveCurrentState();
      }, 100);
    } else {
      // 路由匹配，直接设置状态
      setCurrentStepIndex(validStepIndex);
      setIsGuideActive(true);
      saveCurrentState();
    }
    
    if (onGuideStart) {
      onGuideStart();
    }
  };

  const handleGuideComplete = () => {
    setIsGuideActive(false);
    // 注意：不重置当前步骤索引，保持持久化状态
    savePanelVisible(false); // 保存面板隐藏状态
    saveCurrentState();
    if (onGuideComplete) {
      onGuideComplete();
    }
  };

  const handleStepChange = (newStepIndex) => {
    // 检查步骤索引是否有效
    if (newStepIndex < 0 || newStepIndex >= guideConfig.steps.length) {
      return;
    }
    
    setCurrentStepIndex(newStepIndex);
    // 使用setTimeout确保状态更新完成后再调用导航
    setTimeout(() => {
      handleStepNavigation({
        stepIndex: newStepIndex,
        guideConfig,
        isRouteMatch,
        buildTargetRoute,
        onStepIndexChange: setCurrentStepIndex,
        saveCurrentState
      });
    }, 0);
  };

  if (!guideConfig) {
    return children;
  }

  return (
    <>
      {children}
      
      <GuidePanel
        position={position}
        showOnStart={false}
        onGuideStart={handleGuideStart}
        onGuideComplete={handleGuideComplete}
        onStepChange={handleStepChange}
        guideConfig={guideConfig}
        currentStepIndex={currentStepIndex}
      />
      
      {isGuideActive && (
        <div className="guide-overlay" />
      )}
    </>
  );
};

const guideOverlayStyle = `
  .guide-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.1);
    z-index: 9998;
    pointer-events: none;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = guideOverlayStyle;
  document.head.appendChild(styleElement);
}

export default GuideManager;