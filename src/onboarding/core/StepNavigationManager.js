import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 步骤导航管理器
 * 负责步骤间的导航逻辑、历史记录和前进/后退功能
 */
export class StepNavigationManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // 配置选项
    this.options = {
      maxHistorySize: 50,
      allowBackNavigation: true,
      allowSkip: true,
      debug: false,
      ...options
    };
    
    // 导航状态
    this.state = {
      currentStepIndex: -1,
      currentGuide: null,
      navigationHistory: [],
      canGoBack: false,
      canGoForward: false,
      isNavigating: false
    };
    
    // 引导步骤映射
    this.guideSteps = new Map();
    
    this.log('StepNavigationManager initialized');
  }
  
  /**
   * 设置当前引导的步骤列表
   * @param {string} guideId - 引导ID
   * @param {Array} steps - 步骤列表
   */
  setGuideSteps(guideId, steps) {
    if (!guideId || !Array.isArray(steps)) {
      throw new Error('Guide ID and steps array are required');
    }
    
    this.guideSteps.set(guideId, steps);
    this.state.currentGuide = guideId;
    
    this.log(`Steps set for guide: ${guideId} (${steps.length} steps)`);
    this.emit('guideStepsSet', { guideId, stepCount: steps.length });
  }
  
  /**
   * 导航到指定步骤
   * @param {number} stepIndex - 步骤索引
   * @param {Object} navigationOptions - 导航选项
   */
  async navigateToStep(stepIndex, navigationOptions = {}) {
    if (this.state.isNavigating) {
      throw new Error('Navigation is already in progress');
    }
    
    if (!this.state.currentGuide) {
      throw new Error('No guide is currently active');
    }
    
    const steps = this.guideSteps.get(this.state.currentGuide);
    if (!steps || steps.length === 0) {
      throw new Error('No steps available for current guide');
    }
    
    if (stepIndex < 0 || stepIndex >= steps.length) {
      throw new Error(`Invalid step index: ${stepIndex}. Valid range: 0-${steps.length - 1}`);
    }
    
    try {
      this.state.isNavigating = true;
      
      const currentStepIndex = this.state.currentStepIndex;
      const targetStep = steps[stepIndex];
      
      this.log(`Navigating from step ${currentStepIndex} to ${stepIndex}`);
      this.emit('navigationStarted', { 
        fromStep: currentStepIndex, 
        toStep: stepIndex,
        options: navigationOptions 
      });
      
      // 验证导航条件
      await this.validateNavigation(currentStepIndex, stepIndex, navigationOptions);
      
      // 执行导航前处理
      await this.preNavigate(currentStepIndex, stepIndex, navigationOptions);
      
      // 更新导航历史
      this.updateNavigationHistory(currentStepIndex, stepIndex, navigationOptions);
      
      // 更新当前步骤索引
      this.state.currentStepIndex = stepIndex;
      
      // 更新导航状态
      this.updateNavigationState();
      
      // 执行导航后处理
      await this.postNavigate(currentStepIndex, stepIndex, navigationOptions);
      
      this.state.isNavigating = false;
      
      this.log(`Navigation completed to step ${stepIndex}`);
      this.emit('navigationCompleted', { 
        fromStep: currentStepIndex, 
        toStep: stepIndex,
        step: targetStep 
      });
      
      return targetStep;
      
    } catch (error) {
      this.state.isNavigating = false;
      this.handleError('Navigation failed', error, { stepIndex, navigationOptions });
      throw error;
    }
  }
  
  /**
   * 导航到下一步
   */
  async nextStep(navigationOptions = {}) {
    const nextIndex = this.state.currentStepIndex + 1;
    return await this.navigateToStep(nextIndex, {
      direction: 'forward',
      ...navigationOptions
    });
  }
  
  /**
   * 导航到上一步
   */
  async previousStep(navigationOptions = {}) {
    if (!this.options.allowBackNavigation) {
      throw new Error('Back navigation is not allowed');
    }
    
    const prevIndex = this.state.currentStepIndex - 1;
    return await this.navigateToStep(prevIndex, {
      direction: 'backward',
      ...navigationOptions
    });
  }
  
  /**
   * 导航到第一步
   */
  async firstStep(navigationOptions = {}) {
    return await this.navigateToStep(0, {
      direction: 'reset',
      ...navigationOptions
    });
  }
  
  /**
   * 导航到最后一步
   */
  async lastStep(navigationOptions = {}) {
    const steps = this.guideSteps.get(this.state.currentGuide);
    const lastIndex = steps.length - 1;
    return await this.navigateToStep(lastIndex, {
      direction: 'jump',
      ...navigationOptions
    });
  }
  
  /**
   * 跳过当前引导
   */
  async skipGuide() {
    if (!this.options.allowSkip) {
      throw new Error('Skipping guide is not allowed');
    }
    
    this.log('Skipping current guide');
    this.emit('guideSkipped', { guideId: this.state.currentGuide });
    
    // 重置导航状态
    this.resetNavigation();
    
    return true;
  }
  
  /**
   * 验证导航条件
   */
  async validateNavigation(fromIndex, toIndex, options) {
    const steps = this.guideSteps.get(this.state.currentGuide);
    
    // 检查步骤是否存在
    if (toIndex >= steps.length) {
      throw new Error('Cannot navigate beyond the last step');
    }
    
    // 检查后退导航权限
    if (toIndex < fromIndex && !this.options.allowBackNavigation) {
      throw new Error('Back navigation is not allowed');
    }
    
    // 检查跳跃导航（如果实现的话）
    if (Math.abs(toIndex - fromIndex) > 1 && options.direction !== 'jump') {
      // 这里可以添加更复杂的跳跃验证逻辑
      this.log(`Jump navigation detected: from ${fromIndex} to ${toIndex}`);
    }
    
    this.emit('navigationValidated', { fromIndex, toIndex, isValid: true });
  }
  
  /**
   * 导航前处理
   */
  async preNavigate(fromIndex, toIndex, options) {
    this.log(`Pre-navigation processing: ${fromIndex} -> ${toIndex}`);
    
    // 执行离开当前步骤的处理
    if (fromIndex >= 0) {
      await this.leaveStep(fromIndex, toIndex, options);
    }
    
    // 执行进入目标步骤的准备
    await this.prepareEnterStep(toIndex, fromIndex, options);
    
    this.emit('preNavigation', { fromIndex, toIndex, options });
  }
  
  /**
   * 离开当前步骤
   */
  async leaveStep(currentIndex, nextIndex, options) {
    const steps = this.guideSteps.get(this.state.currentGuide);
    const currentStep = steps[currentIndex];
    
    // 执行离开步骤的清理工作
    if (currentStep.onLeave) {
      await this.executeStepHook(currentStep.onLeave, {
        currentStep,
        nextIndex,
        direction: options.direction
      });
    }
    
    this.emit('stepLeft', { 
      step: currentStep, 
      stepIndex: currentIndex,
      nextIndex 
    });
  }
  
  /**
   * 准备进入步骤
   */
  async prepareEnterStep(targetIndex, previousIndex, options) {
    const steps = this.guideSteps.get(this.state.currentGuide);
    const targetStep = steps[targetIndex];
    
    // 执行进入步骤的准备
    if (targetStep.onEnter) {
      await this.executeStepHook(targetStep.onEnter, {
        targetStep,
        previousIndex,
        direction: options.direction
      });
    }
    
    this.emit('stepEnterPrepared', { 
      step: targetStep, 
      stepIndex: targetIndex,
      previousIndex 
    });
  }
  
  /**
   * 导航后处理
   */
  async postNavigate(fromIndex, toIndex, options) {
    this.log(`Post-navigation processing: ${fromIndex} -> ${toIndex}`);
    
    // 执行进入目标步骤的完成处理
    await this.enterStep(toIndex, fromIndex, options);
    
    this.emit('postNavigation', { fromIndex, toIndex, options });
  }
  
  /**
   * 进入步骤
   */
  async enterStep(targetIndex, previousIndex, options) {
    const steps = this.guideSteps.get(this.state.currentGuide);
    const targetStep = steps[targetIndex];
    
    // 执行进入步骤的完成工作
    if (targetStep.onEnterComplete) {
      await this.executeStepHook(targetStep.onEnterComplete, {
        targetStep,
        previousIndex,
        direction: options.direction
      });
    }
    
    this.emit('stepEntered', { 
      step: targetStep, 
      stepIndex: targetIndex,
      previousIndex 
    });
  }
  
  /**
   * 更新导航历史
   */
  updateNavigationHistory(fromIndex, toIndex, options) {
    // 添加历史记录
    this.state.navigationHistory.push({
      fromStep: fromIndex,
      toStep: toIndex,
      timestamp: Date.now(),
      direction: options.direction,
      options
    });
    
    // 限制历史记录大小
    if (this.state.navigationHistory.length > this.options.maxHistorySize) {
      this.state.navigationHistory.shift();
    }
    
    this.emit('navigationHistoryUpdated', { 
      history: [...this.state.navigationHistory] 
    });
  }
  
  /**
   * 更新导航状态
   */
  updateNavigationState() {
    const steps = this.guideSteps.get(this.state.currentGuide);
    const currentIndex = this.state.currentStepIndex;
    
    // 更新前进/后退状态
    this.state.canGoBack = this.options.allowBackNavigation && currentIndex > 0;
    this.state.canGoForward = currentIndex < steps.length - 1;
    
    this.emit('navigationStateUpdated', { 
      canGoBack: this.state.canGoBack,
      canGoForward: this.state.canGoForward,
      currentStep: currentIndex,
      totalSteps: steps.length 
    });
  }
  
  /**
   * 执行步骤钩子函数
   */
  async executeStepHook(hook, context) {
    if (typeof hook === 'function') {
      return await hook(context);
    }
    
    // 这里可以支持其他类型的钩子（如Promise、字符串命令等）
    return hook;
  }
  
  /**
   * 获取当前步骤
   */
  getCurrentStep() {
    if (this.state.currentStepIndex < 0 || !this.state.currentGuide) {
      return null;
    }
    
    const steps = this.guideSteps.get(this.state.currentGuide);
    return steps[this.state.currentStepIndex];
  }
  
  /**
   * 获取导航历史
   */
  getNavigationHistory() {
    return [...this.state.navigationHistory];
  }
  
  /**
   * 获取导航状态
   */
  getNavigationState() {
    const steps = this.guideSteps.get(this.state.currentGuide);
    return {
      ...this.state,
      currentStep: this.getCurrentStep(),
      totalSteps: steps ? steps.length : 0,
      progress: steps ? (this.state.currentStepIndex + 1) / steps.length : 0
    };
  }
  
  /**
   * 重置导航状态
   */
  resetNavigation() {
    this.state = {
      currentStepIndex: -1,
      currentGuide: null,
      navigationHistory: [],
      canGoBack: false,
      canGoForward: false,
      isNavigating: false
    };
    
    this.guideSteps.clear();
    
    this.log('Navigation reset');
    this.emit('navigationReset');
  }
  
  /**
   * 错误处理
   */
  handleError(message, error, context = {}) {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    this.log(`ERROR: ${errorMessage}`, 'error');
    this.emit('error', { message, error, context });
    
    if (this.options.debug) {
      console.error(message, error, context);
    }
  }
  
  /**
   * 日志记录
   */
  log(message, level = 'info') {
    if (this.options.debug) {
      console.log(`[StepNavigationManager ${level.toUpperCase()}] ${message}`);
    }
    this.emit('log', { level, message });
  }
}