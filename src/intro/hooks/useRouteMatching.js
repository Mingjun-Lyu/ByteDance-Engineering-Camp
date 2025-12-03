import { useCallback } from 'react';

/**
 * 路由匹配hook
 * 提供路由匹配和参数提取功能
 */
export const useRouteMatching = () => {
  /**
   * 检查路由是否匹配
   * @param {string} routePattern - 路由模式（支持参数如 :id）
   * @param {string} currentPath - 当前路径
   * @returns {boolean} 是否匹配
   */
  const isRouteMatch = useCallback((routePattern, currentPath) => {
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
  }, []);

  /**
   * 从路由模式中提取参数
   * @param {string} routePattern - 路由模式
   * @param {string} currentPath - 当前路径
   * @returns {Object} 参数对象
   */
  const extractRouteParams = useCallback((routePattern, currentPath) => {
    const params = {};
    const patternParts = routePattern.split('/');
    const pathParts = currentPath.split('/');
    
    // 移除首尾的空字符串（处理路径开头和结尾的斜杠）
    if (patternParts[0] === '') patternParts.shift();
    if (patternParts[patternParts.length - 1] === '') patternParts.pop();
    if (pathParts[0] === '') pathParts.shift();
    if (pathParts[pathParts.length - 1] === '') pathParts.pop();

    // 检查路径段数量是否匹配
    if (patternParts.length !== pathParts.length) {
      return params;
    }

    // 提取参数
    patternParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[index];
      }
    });

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
  }, []);

  return {
    isRouteMatch,
    extractRouteParams,
    buildTargetRoute
  };
};