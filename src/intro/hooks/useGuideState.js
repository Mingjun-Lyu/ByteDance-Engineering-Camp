import { useState, useEffect } from 'react';
import { getGuideState, recordCurrentStep, setGuideStatus, clearGuideState } from '../utils/state';

/**
 * 引导状态管理hook
 * 处理引导状态的恢复、记录和清除
 */
const useGuideState = (guideConfig) => {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  /**
   * 恢复引导状态
   * @param {Object} routing - 路由hook实例
   * @returns {Object} 恢复操作的结果
   */
  const restoreGuideState = (routing) => {
    const guideState = getGuideState();
    const { step, isGuiding } = guideState;
    
    // 恢复逻辑
    if (step === 0) {
      // 情况1：从未开始或已重置
      setCurrentStepIndex(0);
      setIsGuideActive(false);
      return { action: 'initialized' };
    } 
    else if (step >= 1) {
      // 情况2：有步骤记录
      setCurrentStepIndex(step);
      
      if (isGuiding) {
        // 2a：处于引导状态，自动恢复引导
        setIsGuideActive(true);
        
        // 延迟执行路由跳转，确保组件已渲染
        setTimeout(() => {
          if (guideConfig && guideConfig.steps && step < guideConfig.steps.length) {
            const stepData = guideConfig.steps[step];
            if (stepData) {
              routing.handleStepNavigation(stepData, routing.currentPath);
            }
          }
        }, 100);
        
        return { action: 'resumed', step };
      } else {
        // 2b：非引导状态，仅更新面板状态
        setIsGuideActive(false);
        return { action: 'panel_restored', step };
      }
    }
    
    return { action: 'default' };
  };

  /**
   * 开始引导
   * @param {Function} onGuideStart - 引导开始回调
   * @param {Function} handleStepNavigation - 步骤跳转函数
   */
  const startGuide = (onGuideStart, handleStepNavigation) => {
    // 重置到第一步，并设置引导状态
    setCurrentStepIndex(0);
    setIsGuideActive(true);
    setGuideStatus(true); // 标记为引导状态
    
    // 处理第一步的路由跳转
    handleStepNavigation(0);
    
    if (onGuideStart) {
      onGuideStart();
    }
  };

  /**
   * 完成引导
   * @param {Function} onGuideComplete - 引导完成回调
   */
  const completeGuide = (onGuideComplete) => {
    setIsGuideActive(false);
    setCurrentStepIndex(0);
    setGuideStatus(false); // 清除引导状态
    clearGuideState(); // 清除步骤记录
    
    if (onGuideComplete) {
      onGuideComplete();
    }
  };

  /**
   * 处理步骤变化
   * @param {number} newStepIndex - 新步骤索引
   * @param {Function} handleStepNavigation - 步骤跳转函数
   */
  const handleStepChange = (newStepIndex, handleStepNavigation) => {
    console.log('步骤变更:', { from: currentStepIndex, to: newStepIndex });
    
    // 先记录当前步骤和引导状态
    recordCurrentStep(newStepIndex, isGuideActive);
    
    // 再更新状态
    setCurrentStepIndex(newStepIndex);
    
    // 如果是引导状态，才进行路由跳转
    if (isGuideActive) {
      handleStepNavigation(newStepIndex);
    }
  };

  /**
   * 检查是否可以进行引导
   * @param {Object} config - 配置hook实例
   * @returns {boolean} 是否可以开始引导
   */
  const canStartGuide = (config) => {
    return !config.configError && config.isValidConfig();
  };

  /**
   * 检查是否在引导过程中
   * @returns {boolean} 是否在引导过程中
   */
  const isInGuideProcess = () => {
    return isGuideActive && currentStepIndex >= 0;
  };

  /**
   * 检查是否是最后一步
   * @param {Object} config - 配置hook实例
   * @returns {boolean} 是否是最后一步
   */
  const isLastStep = (config) => {
    return currentStepIndex === config.getTotalSteps() - 1;
  };

  /**
   * 检查是否是第一步
   * @returns {boolean} 是否是第一步
   */
  const isFirstStep = () => {
    return currentStepIndex === 0;
  };

  return {
    isGuideActive,
    currentStepIndex,
    restoreGuideState,
    startGuide,
    completeGuide,
    handleStepChange,
    canStartGuide,
    isInGuideProcess,
    isLastStep,
    isFirstStep,
    setIsGuideActive,
    setCurrentStepIndex
  };
};

export default useGuideState;