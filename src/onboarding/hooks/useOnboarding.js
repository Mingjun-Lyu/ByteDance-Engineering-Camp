import { useState, useEffect, useRef, useCallback } from 'react';
import { OnboardingManager } from '../core/OnboardingManager.js';

/**
 * React Hook for onboarding integration
 * 提供与React组件集成的引导功能
 */
export function useOnboarding(options = {}) {
  const [state, setState] = useState({
    isActive: false,
    currentGuide: null,
    currentStep: null,
    isPaused: false
  });
  
  const managerRef = useRef(null);
  
  // 监听状态变化的回调函数
  const updateState = useCallback(() => {
    if (managerRef.current) {
      const managerState = managerRef.current.getState();
      setState(prevState => {
        // 只有当状态真正改变时才更新，避免不必要的渲染
        if (prevState.isActive === managerState.isActive &&
            prevState.currentGuide === managerState.currentGuide &&
            prevState.currentStep === managerState.currentStep &&
            prevState.isPaused === managerState.isPaused) {
          return prevState;
        }
        return {
          isActive: managerState.isActive,
          currentGuide: managerState.currentGuide,
          currentStep: managerState.currentStep,
          isPaused: managerState.isPaused
        };
      });
    }
  }, []);

  // 初始化管理器
  useEffect(() => {
    const manager = new OnboardingManager(options);
    managerRef.current = manager;
    
    // 监听相关事件
    const events = [
      'guideStarted',
      'guideCompleted', 
      'guidePaused',
      'guideResumed',
      'stepCompleted',
      'guideSkipped'
    ];
    
    events.forEach(event => {
      manager.on(event, updateState);
    });
    
    // 初始状态同步
    updateState();
    
    return () => {
      // 清理事件监听
      events.forEach(event => {
        manager.off(event, updateState);
      });
    };
  }, [options, updateState]);
  
  // 注册引导配置
  const registerGuide = useCallback((guideId, config) => {
    if (managerRef.current) {
      managerRef.current.registerGuide(guideId, config);
    }
  }, [managerRef]);
  
  // 开始引导
  const startGuide = useCallback(async (guideId, startOptions) => {
    if (managerRef.current) {
      return await managerRef.current.startGuide(guideId, startOptions);
    }
    return false;
  }, [managerRef]);
  
  // 暂停引导
  const pauseGuide = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.pauseGuide();
    }
  }, [managerRef]);
  
  // 恢复引导
  const resumeGuide = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.resumeGuide();
    }
  }, [managerRef]);
  
  // 完成当前步骤
  const completeStep = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.completeStep();
    }
  }, [managerRef]);
  
  // 跳过引导
  const skipGuide = useCallback(async (guideId) => {
    if (managerRef.current) {
      await managerRef.current.skipGuide(guideId);
    }
  }, [managerRef]);
  
  // 重置引导
  const resetGuide = useCallback(async (guideId) => {
    if (managerRef.current) {
      await managerRef.current.resetGuide(guideId);
    }
  }, [managerRef]);
  
  // 获取引导配置
  const getGuide = useCallback((guideId) => {
    if (managerRef.current) {
      return managerRef.current.getGuide(guideId);
    }
    return null;
  }, [managerRef]);
  
  // 获取管理器实例（高级用法）
  const getManager = useCallback(() => managerRef.current, [managerRef]);
  
  return {
    // 状态
    ...state,
    
    // 操作方法
    registerGuide,
    startGuide,
    pauseGuide,
    resumeGuide,
    completeStep,
    skipGuide,
    resetGuide,
    getGuide,
    getManager,
    
    // 便捷状态检查
    isGuideActive: (guideId) => state.isActive && state.currentGuide === guideId,
    isStepActive: (guideId, stepIndex) => 
      state.isActive && 
      state.currentGuide === guideId && 
      state.currentStep === stepIndex
  };
}