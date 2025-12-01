import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 悬浮引导按钮的自定义Hook
 * 管理按钮的显示状态、引导进度和用户交互，集成Driver.js引导功能
 */
export const useFloatingGuide = (options = {}) => {
  const {
    autoShow = true,
    storageKey = 'floating-guide-state',
    defaultVisible = true,
    onGuideStart,
    onGuideComplete,
    onGuideSkip,
    guideSteps = [], // 默认引导步骤
    driverOptions = {} // Driver.js配置选项
  } = options;

  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [isLoading, setIsLoading] = useState(false);
  const [guideProgress, setGuideProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [driverInstance, setDriverInstance] = useState(null);
  
  const stepsRef = useRef(guideSteps);
  const driverRef = useRef(null);

  // 从本地存储加载状态
  useEffect(() => {
    if (autoShow) {
      try {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          const { visible, progress, currentStep: savedStep } = JSON.parse(savedState);
          setIsVisible(visible !== undefined ? visible : defaultVisible);
          setGuideProgress(progress || 0);
          setCurrentStep(savedStep || 0);
        }
      } catch (error) {
        console.warn('无法加载引导状态:', error);
      }
    }
  }, [autoShow, storageKey, defaultVisible]);

  // 保存状态到本地存储
  const saveState = useCallback((state) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        visible: state.visible !== undefined ? state.visible : isVisible,
        progress: state.progress !== undefined ? state.progress : guideProgress,
        currentStep: state.currentStep !== undefined ? state.currentStep : currentStep,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('无法保存引导状态:', error);
    }
  }, [storageKey, isVisible, guideProgress, currentStep]);

  // 动态加载Driver.js
  const loadDriver = useCallback(async () => {
    try {
      const driverModule = await import('./driver.js');
      return driverModule.driver;
    } catch (error) {
      console.error('加载Driver.js失败:', error);
      return null;
    }
  }, []);

  // 初始化Driver.js实例
  const initializeDriver = useCallback(async () => {
    const driverFunction = await loadDriver();
    if (!driverFunction) return null;

    const defaultDriverOptions = {
      animate: true,
      allowClose: true,
      overlayClickBehavior: 'next',
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: '步骤 {{current}} / {{total}}',
      nextBtnText: '下一步',
      prevBtnText: '上一步',
      doneBtnText: '完成',
      ...driverOptions,
      
      onHighlightStarted: (element, step) => {
        console.log('开始高亮:', step.popover?.title);
      },
      
      onDeselected: (element, step) => {
        console.log('离开步骤:', step.popover?.title);
      },
      
      onDestroyed: () => {
        console.log('引导程序已结束');
        setIsLoading(false);
        setGuideProgress(100);
        
        if (onGuideComplete) {
          onGuideComplete();
        }
        
        // 引导完成后自动隐藏按钮
        setTimeout(() => {
          hideGuide();
        }, 1000);
      }
    };

    const driver = driverFunction(defaultDriverOptions);
    driverRef.current = driver;
    setDriverInstance(driver);
    return driver;
  }, [loadDriver, driverOptions, onGuideComplete]);

  // 开始引导
  const startGuide = useCallback(async (customSteps = null) => {
    setIsLoading(true);
    
    try {
      // 调用外部回调
      if (onGuideStart) {
        await onGuideStart();
      }

      // 设置引导步骤
      const stepsToUse = customSteps || stepsRef.current;
      
      if (stepsToUse && stepsToUse.length > 0) {
        // 使用Driver.js进行真实引导
        let driver = driverRef.current;
        if (!driver) {
          driver = await initializeDriver();
          if (!driver) {
            throw new Error('无法初始化Driver.js');
          }
        }

        driver.setSteps(stepsToUse);
        
        // 设置进度监听
        setCurrentStep(0);
        setGuideProgress(0);
        
        // 开始引导
        driver.drive();
        
        // 监听步骤变化来更新进度
        const totalSteps = stepsToUse.length;
        const progressInterval = setInterval(() => {
          // 这里可以监听Driver.js的步骤变化来更新进度
          // 目前使用模拟进度
          setGuideProgress(prev => {
            const newProgress = prev + (100 / totalSteps / 10);
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return newProgress;
          });
        }, 200);

        // 安全清除定时器
        setTimeout(() => {
          clearInterval(progressInterval);
        }, totalSteps * 2000);
        
      } else {
        // 如果没有步骤配置，使用默认行为
        console.log('开始用户引导程序');
        
        // 模拟引导进度
        setGuideProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          if (onGuideComplete) {
            onGuideComplete();
          }
          hideGuide();
        }, 1000);
      }
    } catch (error) {
      console.error('引导启动失败:', error);
      setIsLoading(false);
    }
  }, [onGuideStart, onGuideComplete, initializeDriver]);

  // 显示引导按钮
  const showGuide = useCallback(() => {
    setIsVisible(true);
    saveState({ visible: true });
  }, [saveState]);

  // 隐藏引导按钮
  const hideGuide = useCallback(() => {
    setIsVisible(false);
    saveState({ visible: false });
    
    if (onGuideSkip) {
      onGuideSkip();
    }
  }, [saveState, onGuideSkip]);

  // 重置引导状态
  const resetGuide = useCallback(() => {
    setIsVisible(defaultVisible);
    setIsLoading(false);
    setGuideProgress(0);
    setCurrentStep(0);
    
    // 重置Driver.js实例
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
      setDriverInstance(null);
    }
    
    saveState({
      visible: defaultVisible,
      progress: 0,
      currentStep: 0
    });
  }, [defaultVisible, saveState]);

  // 设置引导步骤
  const setSteps = useCallback((steps) => {
    stepsRef.current = steps;
  }, []);

  // 下一步
  const nextStep = useCallback(() => {
    if (driverRef.current && currentStep < stepsRef.current.length - 1) {
      driverRef.current.moveNext();
    }
  }, [currentStep]);

  // 上一步
  const prevStep = useCallback(() => {
    if (driverRef.current && currentStep > 0) {
      driverRef.current.movePrevious();
    }
  }, [currentStep]);

  // 高亮特定元素
  const highlightElement = useCallback(async (elementId) => {
    if (!driverRef.current) {
      const driver = await initializeDriver();
      if (!driver) return;
    }
    
    driverRef.current.highlight({
      element: `#${elementId}`,
      popover: {
        title: '功能说明',
        description: '这是该功能的简要说明'
      }
    });
  }, [initializeDriver]);

  return {
    // 状态
    isVisible,
    isLoading,
    guideProgress,
    currentStep,
    driverInstance,
    
    // 操作方法
    startGuide,
    showGuide,
    hideGuide,
    resetGuide,
    setSteps,
    nextStep,
    prevStep,
    highlightElement,
    
    // 计算属性
    hasSteps: stepsRef.current.length > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === stepsRef.current.length - 1,
    totalSteps: stepsRef.current.length
  };
};

export default useFloatingGuide;