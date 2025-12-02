import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GuidePanel from './GuidePanel';

import homeGuideConfig from '../jsons/guide-config.json';

const GuideManager = ({ 
  children, 
  position = 'top-center',
  onGuideStart,
  onGuideComplete
}) => {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [guideConfig, setGuideConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

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


    const currentParams = extractRouteParams(step.route || '/', location.pathname);
    const targetRoute = buildTargetRoute(step.targetRoute || '/', step.elementRouteInfo, currentParams);
    
    
    if (!isRouteMatch(targetRoute, location.pathname)) {
      
      const fullUrl = window.location.origin + targetRoute;
      
      window.location.href = fullUrl;
    }
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
  }, [location.pathname]);

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
    
    setCurrentStepIndex(0);
    setIsGuideActive(true);
    
    handleStepNavigation(0);
    
    if (onGuideStart) {
      onGuideStart();
    }
  };

  const handleGuideComplete = () => {
    setIsGuideActive(false);
    setCurrentStepIndex(0);
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