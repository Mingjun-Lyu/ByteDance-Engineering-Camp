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

  const isRouteMatch = (routePattern, currentPath) => {
    // 完全匹配
    if (routePattern === currentPath) {
      return true;
    }

    // 特殊处理：根路径匹配所有路径
    if (routePattern === '/') {
      return true; // 根路径匹配所有路径
    }

    // 拆分路径部分
    const patternParts = routePattern.split('/').filter(part => part !== '');
    const pathParts = currentPath.split('/').filter(part => part !== '');

    // 检查路径段数量是否匹配
    if (patternParts.length !== pathParts.length) {
      return false;
    }
    
    // 检查每个部分是否匹配
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      // 如果是参数（以:开头），则匹配任意值
      if (patternPart.startsWith(':')) {
        continue;
      }
      
      // 精确匹配
      if (patternPart !== pathPart) {
        return false;
      }
    }

    return true;
  };

  // const extractRouteParams = (routePattern, currentPath) => {
  //   const params = {};
  //   const patternParts = routePattern.split('/');
  //   const pathParts = currentPath.split('/');
    
  //   // 移除首尾的空字符串（处理路径开头和结尾的斜杠）
  //   if (patternParts[0] === '') patternParts.shift();
  //   if (patternParts[patternParts.length - 1] === '') patternParts.pop();
  //   if (pathParts[0] === '') pathParts.shift();
  //   if (pathParts[pathParts.length - 1] === '') pathParts.pop();

  //   // 检查路径段数量是否匹配
  //   if (patternParts.length !== pathParts.length) {
  //     return params;
  //   }

  //   // 提取参数
  //   patternParts.forEach((part, index) => {
  //     if (part.startsWith(':')) {
  //       const paramName = part.slice(1);
  //       params[paramName] = pathParts[index];
  //     }
  //   });

  //   return params;
  // };

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
      console.warn(`[GuideManager] 配置无效或步骤索引越界: guideConfig=${!!guideConfig}, steps=${guideConfig?.steps?.length}, stepIndex=${stepIndex}`);
      return;
    }

    const nextStep = guideConfig.steps[stepIndex];
    if (!nextStep) {
      console.warn(`[GuideManager] 步骤${stepIndex}不存在`);
      return;
    }

    // 获取当前步骤的配置（用于参数提取）
    // const prevStepIndex = stepIndex - 1;
    // const currentStep = guideConfig.steps[prevStepIndex];
    // const currentStepRoute = currentStep ? currentStep.route || '/' : '/';
    
    // 简化：直接使用默认参数，避免复杂的参数提取逻辑
    const currentParams = { id: '1' }; // 默认使用ID=1

    const targetRoute = buildTargetRoute(nextStep.route || '/', nextStep.elementRouteInfo, currentParams);
    const isMatch = isRouteMatch(targetRoute, location.pathname);
    
    if (!isMatch) {
      // 先同步保存状态到LocalStorage
      const newState = {
        currentStepIndex: stepIndex,
        isGuideActive,
        guideConfig,
        configError,
        lastSaved: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(GUIDE_STATE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.warn('Failed to save guide state before navigation:', error);
      }
      
      // 然后设置React状态
      setCurrentStepIndex(stepIndex);
      
      // 使用window.location.href进行完整页面跳转（解决路由隔离问题）
      window.location.href = targetRoute;
      return;
    }

    // 更新UI状态（在跳转检查之后）
    setCurrentStepIndex(stepIndex);
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
      console.log('[GuideManager] 检查起始路由匹配:', {
        isGuideActive,
        startRoute: guideConfig.config.startRoute,
        currentPath: location.pathname,
        isMatch: isRouteMatch(guideConfig.config.startRoute, location.pathname)
      });
      
      if (!isRouteMatch(guideConfig.config.startRoute, location.pathname)) {
        console.log('[GuideManager] 路由不匹配，跳转到起始路由:', guideConfig.config.startRoute);
        navigate(guideConfig.config.startRoute);
      } else {
        console.log('[GuideManager] 路由匹配，无需跳转');
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
    
    // 获取恢复步骤对应的路由
    const restoredStep = guideConfig.steps[validStepIndex];
    const restoredRoute = restoredStep ? restoredStep.route || '/' : '/';
    
    // 检查当前路由是否与恢复步骤的路由匹配
    const isCurrentRouteMatch = isRouteMatch(restoredRoute, location.pathname);
    
    console.log('[GuideManager] 恢复断点检查:', {
      savedStepIndex,
      validStepIndex,
      restoredRoute,
      currentPath: location.pathname,
      isCurrentRouteMatch
    });
    
    // 如果不匹配，先导航到恢复步骤的路由
    if (!isCurrentRouteMatch) {
      console.log('[GuideManager] 路由不匹配，先导航到恢复步骤的路由:', restoredRoute);
      navigate(restoredRoute);
      
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
      console.log('[GuideManager] 步骤索引无效，可能引导已完成:', newStepIndex);
      return;
    }
    
    setCurrentStepIndex(newStepIndex);
    // 使用setTimeout确保状态更新完成后再调用导航
    setTimeout(() => {
      handleStepNavigation(newStepIndex);
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