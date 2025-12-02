import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 引导路由管理hook
 * 处理引导过程中的路由匹配、参数提取和跳转逻辑
 */
const useGuideRouting = () => {
  const location = useLocation();

  /**
   * 检查路由是否匹配
   * @param {string} routePattern - 路由模式
   * @param {string} currentPath - 当前路径
   * @returns {boolean} 是否匹配
   */
  const isRouteMatch = useCallback((routePattern, currentPath) => {
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
  }, []);

  /**
   * 提取路由参数
   * @param {string} routePattern - 路由模式
   * @param {string} currentPath - 当前路径
   * @returns {Object} 参数对象
   */
  const extractRouteParams = useCallback((routePattern, currentPath) => {
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
  }, []);

  /**
   * 构建目标路由
   * @param {string} targetRoute - 目标路由
   * @param {Object} elementRouteInfo - 元素路由信息
   * @param {Object} currentParams - 当前参数
   * @returns {string} 构建后的路由
   */
  const buildTargetRoute = useCallback((targetRoute, elementRouteInfo, currentParams = {}) => {
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
  }, []);

  /**
   * 处理步骤跳转
   * @param {Object} step - 步骤配置
   * @param {string} currentPath - 当前路径
   */
  const handleStepNavigation = useCallback((step, currentPath) => {
    if (!step) {
      console.warn('[useGuideRouting] 步骤配置不存在');
      return;
    }

    const currentParams = extractRouteParams(step.route || '/', currentPath);
    const targetRoute = buildTargetRoute(step.targetRoute || '/', step.elementRouteInfo, currentParams);
    
    // 检查是否需要跳转：只有当目标路由与当前路由不匹配时才跳转
    if (!isRouteMatch(targetRoute, currentPath)) {
      // 使用完整的URL构建方式解决React Router隔离问题
      const fullUrl = window.location.origin + targetRoute;
      
      // 使用window.location.href进行完整的页面跳转，确保路由切换
      window.location.href = fullUrl;
    }
  }, [extractRouteParams, buildTargetRoute, isRouteMatch]);

  return {
    isRouteMatch,
    extractRouteParams,
    buildTargetRoute,
    handleStepNavigation,
    currentPath: location.pathname
  };
};

export default useGuideRouting;