import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 引导流程控制hook
 * 处理引导过程中的流程控制和副作用
 */
const useGuideFlow = (isGuideActive, guideConfig, currentPath, routing) => {
  const navigate = useNavigate();

  /**
   * 处理引导开始时的路由跳转
   */
  useEffect(() => {
    if (isGuideActive && guideConfig && guideConfig.config?.startRoute) {
      if (!routing.isRouteMatch(guideConfig.config.startRoute, currentPath)) {
        navigate(guideConfig.config.startRoute);
      }
    }
  }, [isGuideActive, guideConfig, currentPath, navigate, routing]);

  /**
   * 验证引导是否可以开始
   * @param {Object} config - 配置hook实例
   * @param {Object} state - 状态hook实例
   * @returns {Object} 验证结果
   */
  const validateGuideStart = (config, state) => {
    if (!state.canStartGuide(config)) {
      return {
        isValid: false,
        message: '引导配置文件缺失或格式错误，无法开始引导！',
        error: config.configError || '配置文件为空或缺少步骤配置'
      };
    }
    
    return {
      isValid: true,
      message: '引导可以开始'
    };
  };

  /**
   * 处理步骤跳转
   * @param {number} stepIndex - 步骤索引
   * @param {Object} config - 配置hook实例
   * @param {Object} routing - 路由hook实例
   */
  const handleStepNavigation = (stepIndex, config, routing) => {
    const step = config.getStepConfig(stepIndex);
    if (step) {
      routing.handleStepNavigation(step, routing.currentPath);
    }
  };

  /**
   * 检查是否需要显示引导遮罩
   * @param {boolean} isGuideActive - 是否在引导状态
   * @returns {boolean} 是否需要显示遮罩
   */
  const shouldShowOverlay = (isGuideActive) => {
    return isGuideActive;
  };

  /**
   * 检查是否需要显示引导面板
   * @param {Object} config - 配置hook实例
   * @returns {boolean} 是否需要显示面板
   */
  const shouldShowPanel = (config) => {
    return config.guideConfig !== null;
  };

  /**
   * 获取引导进度百分比
   * @param {number} currentStep - 当前步骤
   * @param {number} totalSteps - 总步骤数
   * @returns {number} 进度百分比
   */
  const getProgressPercentage = (currentStep, totalSteps) => {
    if (totalSteps === 0) return 0;
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  };

  /**
   * 获取当前步骤信息
   * @param {number} currentStep - 当前步骤
   * @param {Object} config - 配置hook实例
   * @returns {Object} 步骤信息
   */
  const getCurrentStepInfo = (currentStep, config) => {
    const step = config.getStepConfig(currentStep);
    const totalSteps = config.getTotalSteps();
    
    return {
      step,
      currentStep: currentStep + 1,
      totalSteps,
      progress: getProgressPercentage(currentStep, totalSteps),
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === totalSteps - 1
    };
  };

  return {
    validateGuideStart,
    handleStepNavigation,
    shouldShowOverlay,
    shouldShowPanel,
    getProgressPercentage,
    getCurrentStepInfo
  };
};

export default useGuideFlow;