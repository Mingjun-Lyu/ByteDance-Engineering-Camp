import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GuidePanel from './GuidePanel';
import homeGuideConfig from '../jsons/guide-config.json';

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
      return saved ? JSON.parse(saved).isGuideActive || false : false;
    } catch {
      return false;
    }
  });
  
  const [guideConfig, setGuideConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(GUIDE_STATE_KEY);
      return saved ? JSON.parse(saved).currentStepIndex || 0 : 0;
    } catch {
      return 0;
    }
  });
  
  const location = useLocation();
  const navigate = useNavigate();

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
      return saved ? JSON.parse(saved).currentStepIndex || 0 : 0;
    } catch {
      return 0;
    }
  }, []);

  const isRouteMatch = (routePattern, currentPath) => {
    if (routePattern === currentPath) return true;
    
    const patternParts = routePattern.split('/');
    const pathParts = currentPath.split('/');
    
    if (patternParts.length !== pathParts.length) return false;
    
    return patternParts.every((part, i) => 
      part.startsWith(':') || part === pathParts[i]
    );
  };

  const extractRouteParams = (routePattern, currentPath) => {
    const params = {};
    const patternParts = routePattern.split('/');
    const pathParts = currentPath.split('/');
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = pathParts[i];
      }
    }
    
    return params;
  };

  const buildTargetRoute = (targetRoute, elementRouteInfo, currentParams = {}) => {
    let route = targetRoute;
    
    if (elementRouteInfo?.hasRoute) {
      route = elementRouteInfo.route;
      
      if (elementRouteInfo.paramSource && elementRouteInfo.paramValue) {
        const element = elementRouteInfo.element?.trim() 
          ? document.querySelector(elementRouteInfo.element) 
          : null;
        const paramValue = element?.getAttribute(elementRouteInfo.paramSource) || elementRouteInfo.paramValue;
        route = route.replace(':id', paramValue);
      }
    }
    
    Object.keys(currentParams).forEach(key => {
      route = route.replace(`:${key}`, currentParams[key]);
    });
    
    return route;
  };

  const handleStepNavigation = (stepIndex) => {
    if (!guideConfig || !guideConfig.steps || stepIndex >= guideConfig.steps.length) {
      return;
    }

    const step = guideConfig.steps[stepIndex];
    if (!step) {
      console.warn(`[GuideManager] 步骤${stepIndex}不存在`);
      return;
    }

    // 更新UI状态
    setCurrentStepIndex(stepIndex);

    const currentParams = extractRouteParams(step.route || '/', location.pathname);
    const targetRoute = buildTargetRoute(step.targetRoute || '/', step.elementRouteInfo, currentParams);
    
    if (!isRouteMatch(targetRoute, location.pathname)) {
      // 使用window.location.href进行完整页面跳转（解决路由隔离问题）
      window.location.href = targetRoute;
      return;
    }

    // 保存完整状态
    saveCurrentState();
  };

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
    if (isGuideActive && guideConfig && guideConfig.config?.startRoute) {
      if (!isRouteMatch(guideConfig.config.startRoute, location.pathname)) {
        navigate(guideConfig.config.startRoute);
      }
    }
  }, [isGuideActive, guideConfig, location.pathname, navigate]);

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
    
    setCurrentStepIndex(validStepIndex);
    setIsGuideActive(true);
    saveCurrentState();
    
    // 导航到对应的步骤
    handleStepNavigation(validStepIndex);
    
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
    setCurrentStepIndex(newStepIndex);
    handleStepNavigation(newStepIndex);
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