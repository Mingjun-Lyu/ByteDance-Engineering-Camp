import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GuidePanel from './GuidePanel';

// 直接导入JSON配置文件
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

  // 检查路由匹配
  const isRouteMatch = (routePattern, currentPath) => {
    if (routePattern === currentPath) return true;
    
    // 处理动态路由参数
    const patternParts = routePattern.split('/');
    const pathParts = currentPath.split('/');
    
    if (patternParts.length !== pathParts.length) return false;
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) continue; // 动态参数匹配
      if (patternParts[i] !== pathParts[i]) return false;
    }
    
    return true;
  };

  // 提取路由参数
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

  // 构建目标路由
  const buildTargetRoute = (targetRoute, elementRouteInfo, currentParams = {}) => {
    let route = targetRoute;
    
    // 如果有元素路由信息，使用元素的路由
    if (elementRouteInfo && elementRouteInfo.hasRoute) {
      route = elementRouteInfo.route;
      
      // 处理参数替换
      if (elementRouteInfo.paramSource && elementRouteInfo.paramValue) {
        // 从元素属性中提取参数（确保选择器有效）
        if (elementRouteInfo.element && elementRouteInfo.element.trim()) {
          const element = document.querySelector(elementRouteInfo.element);
          if (element) {
            const paramValue = element.getAttribute(elementRouteInfo.paramSource) || elementRouteInfo.paramValue;
            route = route.replace(':id', paramValue);
          }
        } else {
          // 如果没有有效的选择器，使用默认参数值
          route = route.replace(':id', elementRouteInfo.paramValue);
        }
      }
    }
    
    // 替换当前参数
    Object.keys(currentParams).forEach(key => {
      route = route.replace(`:${key}`, currentParams[key]);
    });
    
    return route;
  };

  // 处理步骤跳转
  const handleStepNavigation = (stepIndex) => {
    if (!guideConfig || !guideConfig.steps || stepIndex >= guideConfig.steps.length) {
      return;
    }

    const step = guideConfig.steps[stepIndex];
    // 确保step存在且包含必要的字段
    if (!step) {
      console.warn(`[GuideManager] 步骤${stepIndex}不存在`);
      return;
    }


    const currentParams = extractRouteParams(step.route || '/', location.pathname);
    const targetRoute = buildTargetRoute(step.targetRoute || '/', step.elementRouteInfo, currentParams);
    
    
    // 检查是否需要跳转：只有当目标路由与当前路由不匹配时才跳转
    if (!isRouteMatch(targetRoute, location.pathname)) {
      
      // 使用完整的URL构建方式解决React Router隔离问题
      const fullUrl = window.location.origin + targetRoute;
      
      // 使用window.location.href进行完整的页面跳转，确保路由切换
      window.location.href = fullUrl;
    }
  };

  // 加载引导配置
  useEffect(() => {
    const loadConfig = () => {
      try {
        const config = homeGuideConfig;
        // 检查配置是否有效
        if (!config || !config.title || !config.steps) {
          throw new Error('引导配置文件格式错误或缺失必要字段');
        }
        
        // 为每个步骤添加step字段（如果不存在）
        const enhancedSteps = config.steps.map((step, index) => ({
          step: index + 1,
          ...step
        }));
        
        setGuideConfig({
          ...config,
          steps: enhancedSteps
        });
        setConfigError(null);
      } catch (error) {
        console.warn('Failed to load guide config:', error);
        setConfigError(error.message);
        setGuideConfig(null);
      }
    };

    loadConfig();
  }, [location.pathname]);

  // 处理引导开始时的路由跳转
  useEffect(() => {
    if (isGuideActive && guideConfig && guideConfig.config?.startRoute) {
      if (!isRouteMatch(guideConfig.config.startRoute, location.pathname)) {
        navigate(guideConfig.config.startRoute);
      }
    }
  }, [isGuideActive, guideConfig, location.pathname, navigate]);

  const handleGuideStart = () => {
    // 检查配置是否有效
    if (configError || !guideConfig || guideConfig.steps.length === 0) {
      alert('引导配置文件缺失或格式错误，无法开始引导！\\n\\n错误信息：' + (configError || '配置文件为空或缺少步骤配置'));
      return;
    }
    
    // 重置到第一步
    setCurrentStepIndex(0);
    setIsGuideActive(true);
    
    // 处理第一步的路由跳转
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

  // 处理步骤变化
  const handleStepChange = (newStepIndex) => {
    setCurrentStepIndex(newStepIndex);
    handleStepNavigation(newStepIndex);
  };



  // 如果配置加载失败，不显示引导面板
  if (!guideConfig) {
    return children;
  }

  return (
    <>
      {children}
      
      {/* 引导面板 - 始终显示，不自动隐藏 */}
      <GuidePanel
        position={position}
        showOnStart={true} // 始终显示
        onGuideStart={handleGuideStart}
        onGuideComplete={handleGuideComplete}
        onStepChange={handleStepChange}
        guideConfig={guideConfig}
      />
      
      {/* 引导遮罩层（如果引导正在进行） */}
      {isGuideActive && (
        <div className="guide-overlay" />
      )}
    </>
  );
};

// 添加全局样式
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

// 注入样式到文档头部
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = guideOverlayStyle;
  document.head.appendChild(styleElement);
}

export default GuideManager;