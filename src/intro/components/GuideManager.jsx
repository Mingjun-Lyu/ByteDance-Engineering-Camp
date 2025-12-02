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
    console.log(`[isRouteMatch] ========== 开始路由匹配检查 ==========`);
    console.log(`[isRouteMatch] 输入参数: pattern="${routePattern}", currentPath="${currentPath}"`);
    
    // 完全匹配
    if (routePattern === currentPath) {
      console.log(`[isRouteMatch] ✅ 完全匹配: pattern="${routePattern}" === currentPath="${currentPath}"`);
      console.log(`[isRouteMatch] ========== 匹配检查完成 ==========`);
      return true;
    }

    console.log(`[isRouteMatch] 不完全匹配，开始动态路由检查`);
    
    // 拆分路径部分 - 修复：保留空字符串以正确处理根路径
    const patternParts = routePattern.split('/');
    const pathParts = currentPath.split('/');
    
    // 移除首尾的空字符串（处理路径开头和结尾的斜杠）
    if (patternParts[0] === '') patternParts.shift();
    if (patternParts[patternParts.length - 1] === '') patternParts.pop();
    if (pathParts[0] === '') pathParts.shift();
    if (pathParts[pathParts.length - 1] === '') pathParts.pop();
    
    console.log(`[isRouteMatch] 模式部分拆分结果: ["${patternParts.join('", "')}"] (长度: ${patternParts.length})`);
    console.log(`[isRouteMatch] 路径部分拆分结果: ["${pathParts.join('", "')}"] (长度: ${pathParts.length})`);

    // 检查路径段数量是否匹配
    if (patternParts.length !== pathParts.length) {
      console.log(`[isRouteMatch] ❌ 路径段数量不匹配: pattern=${patternParts.length}, path=${pathParts.length}`);
      console.log(`[isRouteMatch] ========== 匹配检查完成 ==========`);
      return false;
    }

    console.log(`[isRouteMatch] 路径段数量匹配，开始逐段检查`);
    
    // 检查每个部分是否匹配
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      console.log(`[isRouteMatch] 检查第${i}段: patternPart="${patternPart}", pathPart="${pathPart}"`);
      
      // 如果是参数（以:开头），则匹配任意值
      if (patternPart.startsWith(':')) {
        console.log(`[isRouteMatch] ✅ 参数匹配: ${patternPart} = ${pathPart}`);
        continue;
      }
      
      // 精确匹配
      if (patternPart !== pathPart) {
        console.log(`[isRouteMatch] ❌ 部分不匹配: "${patternPart}" != "${pathPart}"`);
        console.log(`[isRouteMatch] ========== 匹配检查完成 ==========`);
        return false;
      }
      
      console.log(`[isRouteMatch] ✅ 精确匹配: "${patternPart}" == "${pathPart}"`);
    }

    console.log(`[isRouteMatch] ✅ 动态路由匹配成功`);
    console.log(`[isRouteMatch] ========== 匹配检查完成 ==========`);
    return true;
  };

  const extractRouteParams = (routePattern, currentPath) => {
    console.log(`[extractRouteParams] ========== 开始参数提取 ==========`);
    console.log(`[extractRouteParams] 输入参数: pattern="${routePattern}", currentPath="${currentPath}"`);
    
    const params = {};
    const patternParts = routePattern.split('/');
    const pathParts = currentPath.split('/');
    
    // 移除首尾的空字符串（处理路径开头和结尾的斜杠）
    if (patternParts[0] === '') patternParts.shift();
    if (patternParts[patternParts.length - 1] === '') patternParts.pop();
    if (pathParts[0] === '') pathParts.shift();
    if (pathParts[pathParts.length - 1] === '') pathParts.pop();
    
    console.log(`[extractRouteParams] 模式部分拆分结果: ["${patternParts.join('", "')}"] (长度: ${patternParts.length})`);
    console.log(`[extractRouteParams] 路径部分拆分结果: ["${pathParts.join('", "')}"] (长度: ${pathParts.length})`);

    // 检查路径段数量是否匹配
    if (patternParts.length !== pathParts.length) {
      console.log(`[extractRouteParams] ❌ 路径段数量不匹配: pattern=${patternParts.length}, path=${pathParts.length}`);
      console.log(`[extractRouteParams] 无法提取参数，返回空对象`);
      console.log(`[extractRouteParams] ========== 参数提取完成 ==========`);
      return params;
    }

    console.log(`[extractRouteParams] ✅ 路径段数量匹配，开始提取参数`);

    // 提取参数
    let extractedCount = 0;
    patternParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[index];
        console.log(`[extractRouteParams] ✅ 提取参数: ${paramName} = ${pathParts[index]}`);
        extractedCount++;
      } else {
        console.log(`[extractRouteParams] 非参数部分: "${part}" = "${pathParts[index]}"`);
      }
    });

    console.log(`[extractRouteParams] 总共提取了 ${extractedCount} 个参数`);
    console.log(`[extractRouteParams] 最终参数对象:`, params);
    console.log(`[extractRouteParams] ========== 参数提取完成 ==========`);
    return params;
  };

  const buildTargetRoute = (targetRoute, elementRouteInfo, currentParams = {}) => {
    console.log(`[GuideManager] 构建目标路由: targetRoute=${targetRoute}, elementRouteInfo=`, elementRouteInfo, 'currentParams=', currentParams);
    
    let route = targetRoute;
    
    if (elementRouteInfo?.hasRoute) {
      console.log(`[GuideManager] 使用elementRouteInfo.route: ${elementRouteInfo.route}`);
      route = elementRouteInfo.route;
      
      if (elementRouteInfo.paramSource && elementRouteInfo.paramValue) {
        const element = elementRouteInfo.element?.trim() 
          ? document.querySelector(elementRouteInfo.element) 
          : null;
        console.log(`[GuideManager] 查找元素: ${elementRouteInfo.element}, 找到:`, !!element);
        const paramValue = element?.getAttribute(elementRouteInfo.paramSource) || elementRouteInfo.paramValue;
        console.log(`[GuideManager] 参数值: ${paramValue}`);
        route = route.replace(':id', paramValue);
        console.log(`[GuideManager] 替换后路由: ${route}`);
      }
    }
    
    console.log(`[GuideManager] 替换前路由: ${route}, 当前参数:`, currentParams);
    Object.keys(currentParams).forEach(key => {
      const oldRoute = route;
      route = route.replace(`:${key}`, currentParams[key]);
      if (oldRoute !== route) {
        console.log(`[GuideManager] 替换参数: :${key} -> ${currentParams[key]}, 新路由: ${route}`);
      }
    });
    
    console.log(`[GuideManager] 最终构建的路由: ${route}`);
    return route;
  };

  const handleStepNavigation = (stepIndex) => {
    console.log(`[GuideManager] ========== 开始处理步骤导航 ==========`);
    console.log(`[GuideManager] 传入的stepIndex: ${stepIndex}`);
    console.log(`[GuideManager] 当前的currentStepIndex状态: ${currentStepIndex}`);
    console.log(`[GuideManager] 当前实际路径: ${location.pathname}`);
    
    if (!guideConfig || !guideConfig.steps || stepIndex >= guideConfig.steps.length) {
      console.warn(`[GuideManager] 配置无效或步骤索引越界: guideConfig=${!!guideConfig}, steps=${guideConfig?.steps?.length}, stepIndex=${stepIndex}`);
      return;
    }

    // 详细检查步骤数组
    console.log(`[GuideManager] === 步骤配置检查 ===`);
    console.log(`[GuideManager] 步骤总数: ${guideConfig.steps.length}`);
    console.log(`[GuideManager] 步骤数组内容:`, guideConfig.steps.map(s => ({step: s.step, route: s.route, targetRoute: s.targetRoute})));
    
    const nextStep = guideConfig.steps[stepIndex];
    if (!nextStep) {
      console.warn(`[GuideManager] 步骤${stepIndex}不存在`);
      return;
    }

    console.log(`[GuideManager] 下一个步骤配置: step=${nextStep.step}, route=${nextStep.route}, targetRoute=${nextStep.targetRoute}`);
    console.log(`[GuideManager] 当前路径: ${location.pathname}`);

    // 获取当前步骤的配置（用于参数提取）
    const prevStepIndex = stepIndex - 1;
    const currentStep = guideConfig.steps[prevStepIndex];
    const currentStepRoute = currentStep ? currentStep.route || '/' : '/';
    console.log(`[GuideManager] 当前步骤route: ${currentStepRoute}`);
    console.log(`[GuideManager] 当前步骤索引: ${prevStepIndex}, 下一个步骤索引: ${stepIndex}`);
    
    console.log(`[GuideManager] === 参数提取过程 ===`);
    // 简化：直接使用默认参数，避免复杂的参数提取逻辑
    const currentParams = { id: '1' }; // 默认使用ID=1
    console.log(`[GuideManager] 使用默认参数:`, currentParams);

    console.log(`[GuideManager] === 目标路由构建过程 ===`);
    console.log(`[GuideManager] 调用buildTargetRoute参数: nextStep.route=${nextStep.route}, nextStep.elementRouteInfo=`, nextStep.elementRouteInfo, 'currentParams=', currentParams);
    const targetRoute = buildTargetRoute(nextStep.route || '/', nextStep.elementRouteInfo, currentParams);
    console.log(`[GuideManager] 构建的目标路由: ${targetRoute}`);
    
    console.log(`[GuideManager] === 路由匹配检查 ===`);
    const isMatch = isRouteMatch(targetRoute, location.pathname);
    console.log(`[GuideManager] 路由匹配结果: ${isMatch}, 当前路径=${location.pathname}, 目标路径=${targetRoute}`);
    
    if (!isMatch) {
      console.log(`[GuideManager] 路径不匹配，准备跳转到: ${targetRoute}`);
      
      // 在跳转之前先保存步骤索引状态
      console.log(`[GuideManager] === 保存步骤状态 ===`);
      setCurrentStepIndex(stepIndex);
      console.log(`[GuideManager] 设置currentStepIndex为: ${stepIndex}`);
      saveCurrentState();
      
      // 使用window.location.href进行完整页面跳转（解决路由隔离问题）
      window.location.href = targetRoute;
      console.log(`[GuideManager] ========== 跳转执行完成 ==========`);
      return;
    }

    console.log(`[GuideManager] 路径匹配，无需跳转`);

    // 更新UI状态（在跳转检查之后）
    console.log(`[GuideManager] === 更新UI状态 ===`);
    setCurrentStepIndex(stepIndex);
    console.log(`[GuideManager] 设置currentStepIndex为: ${stepIndex}`);

    // 保存完整状态
    saveCurrentState();
    console.log(`[GuideManager] ========== 步骤导航处理完成 ==========`);
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
    console.log(`[GuideManager] handleStepChange: 设置currentStepIndex为 ${newStepIndex}`);
    setCurrentStepIndex(newStepIndex);
    // 使用setTimeout确保状态更新完成后再调用导航
    setTimeout(() => {
      console.log(`[GuideManager] handleStepChange: 延迟调用handleStepNavigation(${newStepIndex})`);
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