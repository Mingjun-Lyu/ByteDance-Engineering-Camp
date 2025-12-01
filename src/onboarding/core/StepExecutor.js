import { EventEmitter } from '../utils/EventEmitter.js';
import { AnimationManager } from '../utils/AnimationManager.js';

/**
 * 步骤执行引擎
 * 负责引导步骤的执行、过渡和状态管理
 */
export class StepExecutor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // 配置选项
    this.options = {
      animationDuration: 300,
      transitionDelay: 100,
      autoProceed: false,
      debug: false,
      enableHighlight: true,
      highlightColor: '#ffeb3b',
      highlightOpacity: 0.3,
      enableFade: true,
      enableSlide: false,
      enableScale: false,
      ...options
    };
    
    // 执行状态
    this.state = {
      currentStep: null,
      previousStep: null,
      isExecuting: false,
      isTransitioning: false,
      stepHistory: [],
      executionStartTime: null
    };
    
    // 步骤缓存
    this.stepCache = new Map();
    
    // 动画管理器
    this.animationManager = new AnimationManager(this.options);
    
    // 绑定动画事件
    this.bindAnimationEvents();
    
    this.log('StepExecutor initialized');
  }
  
  /**
   * 绑定动画事件
   */
  bindAnimationEvents() {
    // 高亮事件
    this.animationManager.on('highlightStarted', (data) => {
      this.emit('highlightStarted', data);
    });
    
    this.animationManager.on('highlightCompleted', (data) => {
      this.emit('highlightCompleted', data);
    });
    
    // 淡入淡出事件
    this.animationManager.on('fadeInStarted', (data) => {
      this.emit('fadeInStarted', data);
    });
    
    this.animationManager.on('fadeInCompleted', (data) => {
      this.emit('fadeInCompleted', data);
    });
    
    this.animationManager.on('fadeOutStarted', (data) => {
      this.emit('fadeOutStarted', data);
    });
    
    this.animationManager.on('fadeOutCompleted', (data) => {
      this.emit('fadeOutCompleted', data);
    });
    
    // 滑动事件
    this.animationManager.on('slideInStarted', (data) => {
      this.emit('slideInStarted', data);
    });
    
    this.animationManager.on('slideInCompleted', (data) => {
      this.emit('slideInCompleted', data);
    });
    
    this.animationManager.on('slideOutStarted', (data) => {
      this.emit('slideOutStarted', data);
    });
    
    this.animationManager.on('slideOutCompleted', (data) => {
      this.emit('slideOutCompleted', data);
    });
    
    // 过渡事件
    this.animationManager.on('transitionStarted', (data) => {
      this.emit('transitionStarted', data);
    });
    
    this.animationManager.on('transitionCompleted', (data) => {
      this.emit('transitionCompleted', data);
    });
    
    this.log('Animation events bound');
  }
  
  /**
   * 执行指定步骤
   * @param {Object} step - 步骤配置
   * @param {Object} context - 执行上下文
   */
  async executeStep(step, context = {}) {
    if (!step || !step.id) {
      throw new Error('Step configuration is required');
    }
    
    if (this.state.isExecuting) {
      throw new Error('Step execution is already in progress');
    }
    
    try {
      this.state.isExecuting = true;
      this.state.executionStartTime = Date.now();
      
      // 记录步骤历史
      if (this.state.currentStep) {
        this.state.previousStep = this.state.currentStep;
        this.state.stepHistory.push(this.state.currentStep);
      }
      
      this.state.currentStep = step;
      
      // 如果是第一个步骤，也将其加入历史记录
      if (this.state.stepHistory.length === 0) {
        this.state.stepHistory.push(step);
      }
      
      this.log(`Executing step: ${step.id}`);
      this.emit('stepExecutionStarted', { step, context });
      
      // 验证步骤
      await this.validateStep(step);
      
      // 检查前置条件
      await this.checkPreconditions(step, context);
      
      // 定位目标元素
      const targetElement = await this.locateTarget(step.target);
      
      // 应用步骤过渡动画
      if (this.state.previousStep) {
        await this.startTransition(this.state.previousStep, step);
      }
      
      // 高亮目标元素
      if (this.options.enableHighlight && targetElement) {
        await this.highlightTarget(targetElement, step);
      }
      
      // 执行步骤主体
      const result = await this.executeStepCore(step, context);
      
      // 步骤后置处理
      await this.postExecuteStep(step, result);
      
      this.state.isExecuting = false;
      
      const executionTime = Date.now() - this.state.executionStartTime;
      this.log(`Step execution completed: ${step.id} (${executionTime}ms)`);
      this.emit('stepExecutionCompleted', { 
        step, 
        context, 
        result,
        executionTime 
      });
      
      return result;
      
    } catch (error) {
      this.state.isExecuting = false;
      this.handleError('Step execution failed', error, { step, context });
      throw error;
    }
  }
  
  /**
   * 步骤前置处理
   */
  async preExecuteStep(step, context) {
    this.log(`Pre-execution for step: ${step.id}`);
    
    // 验证步骤配置
    await this.validateStep(step);
    
    // 检查前置条件
    await this.checkPreconditions(step, context);
    
    // 开始过渡动画
    if (this.state.previousStep) {
      await this.startTransition(this.state.previousStep, step);
    }
    
    this.emit('stepPreExecution', { step, context });
  }
  
  /**
   * 执行步骤核心逻辑
   */
  async executeStepCore(step, context) {
    const stepType = step.type || 'info';
    
    switch (stepType) {
      case 'info':
        return await this.executeInfoStep(step, context);
        
      case 'action':
        return await this.executeActionStep(step, context);
        
      case 'interactive':
        return await this.executeInteractiveStep(step, context);
        
      default:
        throw new Error(`Unknown step type: ${stepType}`);
    }
  }
  
  /**
   * 执行信息步骤（仅显示信息）
   */
  async executeInfoStep(step) {
    this.log(`Executing info step: ${step.id}`);
    
    // 显示步骤信息
    await this.displayStepInfo(step);
    
    // 等待用户确认或自动继续
    if (this.options.autoProceed && step.autoProceed !== false) {
      const delay = step.delay || 2000;
      await this.delay(delay);
    }
    
    return { type: 'info', completed: true, stepId: step.id };
  }
  
  /**
   * 执行操作步骤（需要用户操作）
   */
  async executeActionStep(step) {
    this.log(`Executing action step: ${step.id}`);
    
    // 定位目标元素
    const targetElement = await this.locateTarget(step.target);
    
    if (!targetElement) {
      throw new Error(`Target element not found for step: ${step.id}`);
    }
    
    // 高亮目标元素
    await this.highlightTarget(targetElement, step);
    
    // 等待用户操作
    const actionResult = await this.waitForUserAction(targetElement, step);
    
    // 清除高亮
    await this.clearHighlight(targetElement);
    
    return { 
      type: 'action', 
      completed: true, 
      targetElement,
      actionResult 
    };
  }
  
  /**
   * 执行交互步骤（复杂交互）
   */
  async executeInteractiveStep(step, context) {
    this.log(`Executing interactive step: ${step.id}`);
    
    // 执行交互逻辑
    const interactiveResult = await this.executeInteractiveLogic(step, context);
    
    return { 
      type: 'interactive', 
      completed: true, 
      interactiveResult 
    };
  }
  
  /**
   * 步骤后置处理
   */
  async postExecuteStep(step, result) {
    this.log(`Post-execution for step: ${step.id}`);
    
    // 验证执行结果
    await this.validateExecutionResult(step, result);
    
    // 缓存步骤结果
    this.cacheStepResult(step, result);
    
    // 结束过渡动画
    await this.endTransition(step);
    
    this.emit('stepPostExecution', { step, result });
  }
  
  /**
   * 应用步骤过渡动画
   * @param {Object} step - 当前步骤
   * @param {Object} context - 执行上下文
   * @param {HTMLElement} targetElement - 目标元素
   */
  async applyStepTransition(step, context, targetElement) {
    if (!this.options.enableFade && !this.options.enableSlide) {
      return; // 动画已禁用
    }
    
    try {
      // 获取前一个步骤（如果有）
      const previousStep = this.stepCache.get('previousStep');
      
      if (previousStep && previousStep.targetElement) {
        // 执行步骤间过渡动画
        await this.animationManager.transitionSteps(
          { ...previousStep, targetElement: previousStep.targetElement },
          { ...step, targetElement },
          {
            type: this.options.enableSlide ? 'slide' : 'fade',
            duration: this.options.animationDuration,
            delay: this.options.transitionDelay
          }
        );
      } else if (targetElement) {
        // 首次执行步骤，只应用进入动画
        if (this.options.enableFade) {
          await this.animationManager.fadeIn(targetElement, {
            duration: this.options.animationDuration
          });
        } else if (this.options.enableSlide) {
          await this.animationManager.slideIn(targetElement, {
            duration: this.options.animationDuration
          });
        }
      }
      
      // 缓存当前步骤供下次使用
      this.stepCache.set('previousStep', { ...step, targetElement });
      
    } catch (error) {
      this.log(`Transition animation failed: ${error.message}`, 'warn');
      // 动画失败不应阻止步骤执行
    }
  }
  
  /**
   * 开始步骤过渡
   */
  async startTransition(fromStep, toStep) {
    if (this.state.isTransitioning) {
      return;
    }
    
    this.state.isTransitioning = true;
    
    this.log(`Starting transition from ${fromStep.id} to ${toStep.id}`);
    this.emit('transitionStarted', { fromStep, toStep });
    
    // 执行过渡动画
    await this.animationManager.startTransition(fromStep, toStep);
    
    // 过渡延迟
    await this.delay(this.options.transitionDelay);
  }
  
  /**
   * 结束步骤过渡
   */
  async endTransition(step) {
    if (!this.state.isTransitioning) {
      return;
    }
    
    this.log(`Ending transition for step: ${step.id}`);
    
    // 结束过渡动画
    await this.animationManager.endTransition(step);
    
    this.state.isTransitioning = false;
    this.emit('transitionEnded', { step });
  }
  
  /**
   * 验证步骤配置
   */
  async validateStep(step) {
    const requiredFields = ['id', 'title'];
    const missingFields = requiredFields.filter(field => !step[field] || step[field].trim() === '');
    
    if (missingFields.length > 0) {
      throw new Error(`Step validation failed. Missing fields: ${missingFields.join(', ')}`);
    }
    
    // 验证步骤类型
    const validTypes = ['info', 'action', 'interactive'];
    if (step.type && !validTypes.includes(step.type)) {
      throw new Error(`Invalid step type: ${step.type}. Valid types: ${validTypes.join(', ')}`);
    }
    
    this.emit('stepValidated', { step, isValid: true });
  }
  
  /**
   * 检查前置条件
   */
  async checkPreconditions(step, context) {
    if (!step.conditions || step.conditions.length === 0) {
      return true;
    }
    
    for (const condition of step.conditions) {
      const isMet = await this.evaluateCondition(condition, context);
      if (!isMet) {
        throw new Error(`Precondition not met for step: ${step.id}`);
      }
    }
    
    return true;
  }
  
  /**
   * 定位目标元素
   */
  async locateTarget(targetConfig) {
    if (!targetConfig) {
      return null;
    }
    
    // 支持直接传递CSS选择器字符串或包含selector属性的对象
    let selector;
    if (typeof targetConfig === 'string') {
      selector = targetConfig;
    } else if (targetConfig.selector) {
      selector = targetConfig.selector;
    } else {
      return null;
    }
    
    // 使用简单的CSS选择器定位
    const element = document.querySelector(selector);
    
    if (!element) {
      this.log(`Target element not found with selector: ${selector}`, 'warn');
      return null;
    }
    
    return element;
  }
  
  /**
   * 高亮目标元素
   * @param {HTMLElement} element - 目标元素
   * @param {Object} step - 步骤配置
   */
  async highlightTarget(element, step) {
    if (!element || typeof document === 'undefined') return;
    
    try {
      // 使用动画管理器处理高亮
      const cleanup = await this.animationManager.highlightElement(element, {
        duration: this.options.animationDuration,
        color: this.options.highlightColor,
        opacity: this.options.highlightOpacity,
        pulse: true
      });
      
      // 缓存清理函数
      if (cleanup && typeof cleanup === 'function') {
        this.stepCache.set(`highlight_${step.id}`, cleanup);
      }
      
    } catch (error) {
      this.log(`Highlight failed: ${error.message}`, 'warn');
    }
  }
  
  /**
   * 清除高亮
   * @param {HTMLElement} element - 目标元素
   * @param {string} stepId - 步骤ID（可选）
   */
  async clearHighlight(element, stepId) {
    if (!element) return;
    
    try {
      // 使用动画管理器清除高亮
      await this.animationManager.clearHighlight(element);
      
      // 如果有步骤ID，清理对应的缓存
      if (stepId) {
        const cleanupKey = `highlight_${stepId}`;
        this.stepCache.delete(cleanupKey);
      }
      
      this.emit('targetHighlightCleared', { element });
      
    } catch (error) {
      this.log(`Clear highlight failed: ${error.message}`, 'warn');
    }
  }
  
  /**
   * 清理指定步骤的高亮效果
   * @param {string} stepId - 步骤ID
   */
  clearStepHighlight(stepId) {
    try {
      const cleanupKey = `highlight_${stepId}`;
      const cleanup = this.stepCache.get(cleanupKey);
      
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
        this.stepCache.delete(cleanupKey);
      }
    } catch (error) {
      this.log(`Clear step highlight failed: ${error.message}`, 'warn');
    }
  }
  
  /**
   * 等待用户操作
   */
  async waitForUserAction(element, step) {
    return new Promise((resolve, reject) => {
      const timeout = step.timeout || 30000; // 默认30秒超时
      let timeoutId;
      
      const cleanup = () => {
        element.removeEventListener('click', clickHandler);
        clearTimeout(timeoutId);
      };
      
      const clickHandler = (event) => {
        cleanup();
        resolve({ action: 'click', event });
      };
      
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('User action timeout'));
      }, timeout);
      
      element.addEventListener('click', clickHandler);
    });
  }
  
  /**
   * 显示步骤信息
   */
  async displayStepInfo(step) {
    // 这里将集成UI组件
    // 暂时使用控制台输出
    console.log(`[Guide Step] ${step.title}: ${step.content}`);
    
    this.emit('stepInfoDisplayed', { step });
  }
  
  /**
   * 执行交互逻辑
   */
  async executeInteractiveLogic(step) {
    // 这里将实现复杂的交互逻辑
    // 暂时返回默认结果
    return { interactive: true, stepId: step.id };
  }
  
  /**
   * 评估条件
   */
  async evaluateCondition() {
    // 这里将集成ConditionValidator类
    // 暂时返回true
    return true;
  }
  
  /**
   * 验证执行结果
   */
  async validateExecutionResult(step, result) {
    if (!result || !result.completed) {
      throw new Error(`Step execution result validation failed for step: ${step.id}`);
    }
    
    return true;
  }
  
  /**
   * 缓存步骤结果
   */
  cacheStepResult(step, result) {
    this.stepCache.set(step.id, {
      step,
      result,
      timestamp: Date.now()
    });
  }
  
  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 获取当前步骤
   */
  getCurrentStep() {
    return this.state.currentStep;
  }
  
  /**
   * 获取步骤历史
   */
  getStepHistory() {
    return [...this.state.stepHistory];
  }
  
  /**
   * 获取执行状态
   */
  getExecutionState() {
    return { ...this.state };
  }
  
  /**
   * 重置执行器状态
   */
  reset() {
    // 清理所有高亮效果
    for (const [key, value] of this.stepCache.entries()) {
      if (key.startsWith('highlight_') && typeof value === 'function') {
        try {
          value();
        } catch (error) {
          this.log(`Reset highlight failed: ${error.message}`, 'warn');
        }
      }
    }
    
    this.state = {
      currentStep: null,
      previousStep: null,
      isExecuting: false,
      isTransitioning: false,
      stepHistory: [],
      executionStartTime: null
    };
    
    this.stepCache.clear();
    
    this.log('StepExecutor reset');
    this.emit('reset');
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
      console.log(`[StepExecutor ${level.toUpperCase()}] ${message}`);
    }
    this.emit('log', { level, message });
  }
}

