import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 路由导航hook
 * 提供路由跳转和导航管理功能
 */
export const useRouteNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 处理步骤导航
   * @param {number} stepIndex - 步骤索引
   * @param {Object} guideConfig - 引导配置
   * @param {Function} isRouteMatch - 路由匹配函数
   * @param {Function} buildTargetRoute - 构建目标路由函数
   * @param {Function} onStepIndexChange - 步骤索引变化回调
   * @param {Function} saveCurrentState - 保存状态回调
   */
  const handleStepNavigation = useCallback(({
    stepIndex,
    guideConfig,
    isRouteMatch,
    buildTargetRoute,
    onStepIndexChange,
    saveCurrentState
  }) => {
    if (!guideConfig || !guideConfig.steps || stepIndex >= guideConfig.steps.length) {
      console.warn(`[useRouteNavigation] 配置无效或步骤索引越界: guideConfig=${!!guideConfig}, steps=${guideConfig?.steps?.length}, stepIndex=${stepIndex}`);
      return;
    }

    const nextStep = guideConfig.steps[stepIndex];
    if (!nextStep) {
      console.warn(`[useRouteNavigation] 步骤${stepIndex}不存在`);
      return;
    }

    // 简化：直接使用默认参数，避免复杂的参数提取逻辑
    const currentParams = { id: '1' }; // 默认使用ID=1

    const targetRoute = buildTargetRoute(nextStep.route || '/', nextStep.elementRouteInfo, currentParams);
    const isMatch = isRouteMatch(targetRoute, location.pathname);
    
    if (!isMatch) {
      // 先同步保存状态到LocalStorage
      const newState = {
        currentStepIndex: stepIndex,
        isGuideActive: true,
        guideConfig,
        configError: null,
        lastSaved: new Date().toISOString()
      };
      
      try {
        localStorage.setItem('guide_guide_state', JSON.stringify(newState));
      } catch (error) {
        console.warn('Failed to save guide state before navigation:', error);
      }
      
      // 然后设置React状态
      if (onStepIndexChange) {
        onStepIndexChange(stepIndex);
      }
      
      // 使用window.location.href进行完整页面跳转（解决路由隔离问题）
      window.location.href = targetRoute;
      return;
    }

    // 更新UI状态（在跳转检查之后）
    if (onStepIndexChange) {
      onStepIndexChange(stepIndex);
    }
    
    if (saveCurrentState) {
      saveCurrentState();
    }
  }, [location.pathname]);



  /**
   * 处理恢复断点导航
   * @param {Object} guideConfig - 引导配置
   * @param {Function} isRouteMatch - 路由匹配函数
   * @param {Function} getCurrentStepIndex - 获取当前步骤索引函数
   * @param {Function} onStepIndexChange - 步骤索引变化回调
   * @param {Function} onGuideActiveChange - 引导激活状态变化回调
   * @param {Function} saveCurrentState - 保存状态回调
   */
  const handleRestorePointNavigation = useCallback(({
    guideConfig,
    isRouteMatch,
    getCurrentStepIndex,
    onStepIndexChange,
    onGuideActiveChange,
    saveCurrentState
  }) => {
    if (!guideConfig) return;

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
    
    console.log('[useRouteNavigation] 恢复断点检查:', {
      savedStepIndex,
      validStepIndex,
      restoredRoute,
      currentPath: location.pathname,
      isCurrentRouteMatch
    });
    
    // 如果不匹配，先导航到恢复步骤的路由
    if (!isCurrentRouteMatch) {
      console.log('[useRouteNavigation] 路由不匹配，先导航到恢复步骤的路由:', restoredRoute);
      navigate(restoredRoute);
      
      // 延迟设置状态，确保路由跳转完成
      setTimeout(() => {
        if (onStepIndexChange) {
          onStepIndexChange(validStepIndex);
        }
        if (onGuideActiveChange) {
          onGuideActiveChange(true);
        }
        if (saveCurrentState) {
          saveCurrentState();
        }
      }, 100);
    } else {
      // 路由匹配，直接设置状态
      if (onStepIndexChange) {
        onStepIndexChange(validStepIndex);
      }
      if (onGuideActiveChange) {
        onGuideActiveChange(true);
      }
      if (saveCurrentState) {
        saveCurrentState();
      }
    }
  }, [navigate, location.pathname]);

  /**
   * 检查当前步骤路由是否需要跳转
   * @param {boolean} isGuideActive - 引导是否激活
   * @param {Object} guideConfig - 引导配置
   * @param {Function} isRouteMatch - 路由匹配函数
   * @param {number} currentStepIndex - 当前步骤索引
   */
  const checkCurrentStepRouteNavigation = useCallback(({
    isGuideActive,
    guideConfig,
    isRouteMatch,
    currentStepIndex
  }) => {
    if (isGuideActive && guideConfig && guideConfig.steps && guideConfig.steps.length > 0) {
      // 获取当前步骤对应的路由
      const currentStep = guideConfig.steps[currentStepIndex];
      const currentStepRoute = currentStep?.route || '/';
      
      console.log('[useRouteNavigation] 检查当前步骤路由匹配:', {
        isGuideActive,
        currentStepIndex,
        currentStepRoute,
        currentPath: location.pathname,
        isMatch: isRouteMatch(currentStepRoute, location.pathname)
      });
      
      if (!isRouteMatch(currentStepRoute, location.pathname)) {
        console.log('[useRouteNavigation] 路由不匹配，跳转到当前步骤路由:', currentStepRoute);
        navigate(currentStepRoute);
      } else {
        console.log('[useRouteNavigation] 路由匹配，无需跳转');
      }
    }
  }, [navigate, location.pathname]);

  return {
    handleStepNavigation,
    handleRestorePointNavigation,
    checkCurrentStepRouteNavigation,
    navigate
  };
};