import { EventEmitter } from '../utils/EventEmitter.js';
import { StorageManager } from '../storage/StorageManager.js';
import { StepExecutor } from './StepExecutor.js';
import { StepNavigationManager } from './StepNavigationManager.js';
import { StepStateManager } from './StepStateManager.js';

/**
 * 新手引导管理器核心类
 * 负责引导的生命周期管理、状态控制和事件分发
 */
export class OnboardingManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // 配置选项
    this.options = {
      storageKey: 'onboarding_state',
      autoSave: true,
      debug: false,
      stepExecution: {
        animationDuration: 300,
        transitionDelay: 100,
        autoProceed: false
      },
      navigation: {
        maxHistorySize: 50,
        allowBackNavigation: true,
        allowSkip: true
      },
      stateManagement: {
        autoSave: true,
        saveInterval: 1000,
        maxStateHistory: 20
      },
      ...options
    };
    
    // 状态管理
    this.state = {
      currentGuide: null,
      currentStep: null,
      isActive: false,
      isPaused: false,
      completedGuides: new Set(),
      skippedGuides: new Set()
    };
    
    // 存储管理器
    this.storage = new StorageManager(this.options.storageKey);
    
    // 引导配置映射
    this.guides = new Map();
    
    // 步骤执行引擎
    this.stepExecutor = new StepExecutor(this.options.stepExecution);
    this.stepNavigation = new StepNavigationManager(this.options.navigation);
    this.stepStateManager = new StepStateManager(this.options.stateManagement);
    
    // 绑定事件
    this.bindStepEngineEvents();
    
    // 初始化
    this.initialize();
  }
  
  /**
   * 初始化管理器
   */
  async initialize() {
    try {
      // 从存储中恢复状态
      const savedState = await this.storage.load();
      if (savedState) {
        // 恢复Set对象
        this.state.completedGuides = new Set(savedState.completedGuides || []);
        this.state.skippedGuides = new Set(savedState.skippedGuides || []);
        
        // 恢复其他状态
        this.state.currentGuide = savedState.currentGuide || null;
        this.state.currentStep = savedState.currentStep || null;
        this.state.isActive = savedState.isActive || false;
        this.state.isPaused = savedState.isPaused || false;
        
        this.log('State restored from storage');
      }
      
      this.emit('initialized', this.state);
    } catch (error) {
      this.handleError('Failed to initialize', error);
    }
  }
  
  /**
   * 绑定步骤引擎事件
   */
  bindStepEngineEvents() {
    // 步骤执行器事件
    this.stepExecutor.on('stepExecutionStarted', (data) => {
      this.emit('stepExecutionStarted', data);
    });
    
    this.stepExecutor.on('stepExecutionCompleted', (data) => {
      this.emit('stepExecutionCompleted', data);
    });
    
    this.stepExecutor.on('error', (data) => {
      this.handleError('Step execution error', data.error, data.context);
    });
    
    // 步骤导航事件
    this.stepNavigation.on('navigationStarted', (data) => {
      this.emit('navigationStarted', data);
    });
    
    this.stepNavigation.on('navigationCompleted', (data) => {
      this.emit('navigationCompleted', data);
    });
    
    // 步骤状态事件
    this.stepStateManager.on('executionStarted', (data) => {
      this.emit('executionStarted', data);
    });
    
    this.stepStateManager.on('executionCompleted', (data) => {
      this.emit('executionCompleted', data);
    });
    
    this.log('Step engine events bound');
  }
  
  /**
   * 注册引导配置
   * @param {string} guideId - 引导ID
   * @param {Object} config - 引导配置
   */
  registerGuide(guideId, config) {
    if (!guideId || !config) {
      throw new Error('Guide ID and config are required');
    }
    
    this.guides.set(guideId, {
      id: guideId,
      name: config.name || guideId,
      steps: config.steps || [],
      conditions: config.conditions || [],
      ...config
    });
    
    this.log(`Guide registered: ${guideId}`);
    this.emit('guideRegistered', guideId);
  }
  
  /**
   * 开始引导
   * @param {string} guideId - 引导ID
   */
  async startGuide(guideId) {
    try {
      if (this.state.isActive) {
        throw new Error('Another guide is already active');
      }
      
      const guide = this.guides.get(guideId);
      if (!guide) {
        throw new Error(`Guide not found: ${guideId}`);
      }
      
      // 检查引导是否已完成或已跳过
      if (this.state.completedGuides.has(guideId)) {
        this.log(`Guide already completed: ${guideId}`);
        return false;
      }
      
      if (this.state.skippedGuides.has(guideId)) {
        this.log(`Guide was skipped: ${guideId}`);
        return false;
      }
      
      // 更新状态
      this.state.currentGuide = guideId;
      this.state.currentStep = 0;
      this.state.isActive = true;
      this.state.isPaused = false;
      
      // 初始化步骤引擎
      await this.initializeStepEngine(guide);
      
      this.log(`Starting guide: ${guideId}`);
      this.emit('guideStarted', { guideId, step: 0 });
      
      // 自动保存状态
      if (this.options.autoSave) {
        await this.saveState();
      }
      
      return true;
    } catch (error) {
      this.handleError('Failed to start guide', error);
      return false;
    }
  }
  
  /**
   * 导航到下一步
   */
  async nextStep() {
    try {
      if (!this.state.isActive || this.state.isPaused) {
        throw new Error('No active guide or guide is paused');
      }
      
      const guide = this.guides.get(this.state.currentGuide);
      if (!guide) {
        throw new Error('Current guide not found');
      }
      
      const currentStepIndex = this.state.currentStep;
      const nextStepIndex = await this.stepNavigation.getNextStep(currentStepIndex);
      
      if (nextStepIndex === -1) {
        // 没有下一步，完成引导
        await this.completeGuide();
        return true;
      }
      
      // 导航到下一步
      await this.stepNavigation.navigateToStep(nextStepIndex);
      
      // 更新当前步骤
      this.state.currentStep = nextStepIndex;
      
      // 执行下一步
      await this.executeCurrentStep();
      
      this.log(`Navigated to next step: ${nextStepIndex}`);
      this.emit('stepNavigated', { 
        guideId: this.state.currentGuide, 
        fromStep: currentStepIndex,
        toStep: nextStepIndex 
      });
      
      // 自动保存状态
      if (this.options.autoSave) {
        await this.saveState();
      }
      
      return true;
      
    } catch (error) {
      this.handleError('Failed to navigate to next step', error);
      return false;
    }
  }
  
  /**
   * 导航到上一步
   */
  async previousStep() {
    try {
      if (!this.state.isActive || this.state.isPaused) {
        throw new Error('No active guide or guide is paused');
      }
      
      const guide = this.guides.get(this.state.currentGuide);
      if (!guide) {
        throw new Error('Current guide not found');
      }
      
      const currentStepIndex = this.state.currentStep;
      const previousStepIndex = await this.stepNavigation.getPreviousStep(currentStepIndex);
      
      if (previousStepIndex === -1) {
        this.log('Already at first step');
        return false;
      }
      
      // 导航到上一步
      await this.stepNavigation.navigateToStep(previousStepIndex);
      
      // 更新当前步骤
      this.state.currentStep = previousStepIndex;
      
      // 执行上一步
      await this.executeCurrentStep();
      
      this.log(`Navigated to previous step: ${previousStepIndex}`);
      this.emit('stepNavigated', { 
        guideId: this.state.currentGuide, 
        fromStep: currentStepIndex,
        toStep: previousStepIndex 
      });
      
      // 自动保存状态
      if (this.options.autoSave) {
        await this.saveState();
      }
      
      return true;
      
    } catch (error) {
      this.handleError('Failed to navigate to previous step', error);
      return false;
    }
  }
  
  /**
   * 跳转到指定步骤
   * @param {number} stepIndex - 步骤索引
   */
  async jumpToStep(stepIndex) {
    try {
      if (!this.state.isActive || this.state.isPaused) {
        throw new Error('No active guide or guide is paused');
      }
      
      const guide = this.guides.get(this.state.currentGuide);
      if (!guide) {
        throw new Error('Current guide not found');
      }
      
      if (stepIndex < 0 || stepIndex >= guide.steps.length) {
        throw new Error(`Invalid step index: ${stepIndex}`);
      }
      
      const currentStepIndex = this.state.currentStep;
      
      // 验证是否可以跳转到该步骤
      const canNavigate = await this.stepNavigation.canNavigateToStep(stepIndex);
      if (!canNavigate) {
        throw new Error(`Cannot navigate to step ${stepIndex}`);
      }
      
      // 导航到指定步骤
      await this.stepNavigation.navigateToStep(stepIndex);
      
      // 更新当前步骤
      this.state.currentStep = stepIndex;
      
      // 执行步骤
      await this.executeCurrentStep();
      
      this.log(`Jumped to step: ${stepIndex}`);
      this.emit('stepJumped', { 
        guideId: this.state.currentGuide, 
        fromStep: currentStepIndex,
        toStep: stepIndex 
      });
      
      // 自动保存状态
      if (this.options.autoSave) {
        await this.saveState();
      }
      
      return true;
      
    } catch (error) {
      this.handleError('Failed to jump to step', error);
      return false;
    }
  }
  
  /**
   * 暂停引导
   */
  pauseGuide() {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }
    
    this.state.isPaused = true;
    this.log('Guide paused');
    this.emit('guidePaused', { guideId: this.state.currentGuide });
    
    // 暂停步骤执行引擎 - 简化实现
    this.stepExecutor.reset();
    
    // 如果有当前执行，暂停它
    if (this.stepStateManager.state.currentExecution) {
      this.stepStateManager.pauseStepExecution(this.stepStateManager.state.currentExecution.id);
    }
  }
  
  /**
   * 恢复引导
   */
  async resumeGuide() {
    if (!this.state.isActive || !this.state.isPaused) {
      return;
    }
    
    this.state.isPaused = false;
    this.log('Guide resumed');
    this.emit('guideResumed', { guideId: this.state.currentGuide });
    
    // 恢复步骤执行引擎 - 简化实现
    // 如果有当前执行，恢复它
    if (this.stepStateManager.state.currentExecution) {
      this.stepStateManager.resumeStepExecution(this.stepStateManager.state.currentExecution.id);
    }
    
    // 重新执行当前步骤
    await this.executeCurrentStep();
    
    if (this.options.autoSave) {
      await this.saveState();
    }
  }
  
  /**
   * 初始化步骤引擎
   * @param {Object} guide - 引导配置
   */
  async initializeStepEngine(guide) {
    try {
      // 设置步骤导航
      this.stepNavigation.setGuideSteps(guide.id, guide.steps);
      
      // 重置步骤状态
      this.stepStateManager.reset();
      
      // 导航到第一步
      await this.stepNavigation.navigateToStep(0);
      
      // 执行第一步
      await this.executeCurrentStep();
      
      this.log('Step engine initialized');
    } catch (error) {
      this.handleError('Failed to initialize step engine', error);
      throw error;
    }
  }
  
  /**
   * 执行当前步骤
   */
  async executeCurrentStep() {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }
    
    const guide = this.guides.get(this.state.currentGuide);
    if (!guide) {
      this.handleError('Current guide not found');
      return;
    }
    
    const currentStepIndex = this.state.currentStep;
    const currentStep = guide.steps[currentStepIndex];
    
    if (!currentStep) {
      this.handleError(`Step not found at index: ${currentStepIndex}`);
      return;
    }
    
    let executionId;
    try {
      // 开始执行状态跟踪
      executionId = this.stepStateManager.startStepExecution(currentStep, {
        guideId: this.state.currentGuide,
        stepIndex: currentStepIndex
      });
      
      // 执行步骤
      const result = await this.stepExecutor.executeStep(currentStep, {
        guideId: this.state.currentGuide,
        stepIndex: currentStepIndex,
        executionId
      });
      
      // 完成执行状态跟踪
      this.stepStateManager.completeStepExecution(executionId, result);
      
      this.log(`Step executed: ${currentStep.id}`);
      this.emit('stepExecuted', { 
        guideId: this.state.currentGuide, 
        stepIndex: currentStepIndex,
        step: currentStep,
        result 
      });
      
      return result;
      
    } catch (error) {
      if (executionId) {
        this.stepStateManager.failStepExecution(executionId, error);
      }
      this.handleError('Failed to execute step', error, { 
        guideId: this.state.currentGuide, 
        stepIndex: currentStepIndex 
      });
      throw error;
    }
  }
  
  /**
   * 完成当前步骤并进入下一步
   */
  async completeStep() {
    try {
      if (!this.state.isActive || this.state.isPaused) {
        throw new Error('No active guide or guide is paused');
      }
      
      const guide = this.guides.get(this.state.currentGuide);
      if (!guide) {
        throw new Error('Current guide not found');
      }
      
      const currentStepIndex = this.state.currentStep;
      const nextStepIndex = currentStepIndex + 1;
      
      // 检查是否还有下一步
      if (nextStepIndex >= guide.steps.length) {
        // 引导完成
        await this.completeGuide();
        return;
      }
      
      // 使用步骤导航引擎导航到下一步
      await this.stepNavigation.navigateToStep(nextStepIndex);
      
      // 更新当前步骤
      this.state.currentStep = nextStepIndex;
      
      // 执行下一步
      await this.executeCurrentStep();
      
      this.log(`Step completed: ${currentStepIndex}, moving to: ${nextStepIndex}`);
      this.emit('stepCompleted', { 
        guideId: this.state.currentGuide, 
        stepIndex: currentStepIndex 
      });
      
      // 自动保存状态
      if (this.options.autoSave) {
        await this.saveState();
      }
      
      return true;
    } catch (error) {
      this.handleError('Failed to complete step', error);
      return false;
    }
  }
  
  /**
   * 完成整个引导
   */
  async completeGuide() {
    if (!this.state.isActive) {
      return;
    }
    
    const guideId = this.state.currentGuide;
    
    // 重置步骤执行状态
    this.stepStateManager.reset();
    
    // 标记引导为已完成
    this.state.completedGuides.add(guideId);
    this.state.currentGuide = null;
    this.state.currentStep = 0;
    this.state.isActive = false;
    this.state.isPaused = false;
    
    // 清理步骤引擎
    this.stepNavigation.resetNavigation();
    this.stepExecutor.reset();
    
    this.log(`Guide completed: ${guideId}`);
    this.emit('guideCompleted', { guideId });
    
    if (this.options.autoSave) {
      await this.saveState();
    }
  }
  
  /**
   * 跳过引导
   * @param {string} guideId - 引导ID
   */
  async skipGuide(guideId) {
    if (this.state.isActive && this.state.currentGuide === guideId) {
      this.state.isActive = false;
      this.state.currentGuide = null;
      this.state.currentStep = null;
    }
    
    this.state.skippedGuides.add(guideId);
    this.log(`Guide skipped: ${guideId}`);
    this.emit('guideSkipped', guideId);
    
    if (this.options.autoSave) {
      await this.saveState();
    }
  }
  
  /**
   * 重置引导状态
   * @param {string} guideId - 引导ID（可选，为空则重置所有）
   */
  async resetGuide(guideId = null) {
    if (guideId) {
      this.state.completedGuides.delete(guideId);
      this.state.skippedGuides.delete(guideId);
      
      // 如果重置的是当前活动引导，则清理步骤引擎
      if (this.state.currentGuide === guideId) {
        this.stepExecutor.reset();
        this.stepNavigation.reset();
        this.stepStateManager.reset();
        
        this.state.currentGuide = null;
        this.state.currentStep = 0;
        this.state.isActive = false;
        this.state.isPaused = false;
      }
      
      this.log(`Guide reset: ${guideId}`);
    } else {
      this.state.completedGuides.clear();
      this.state.skippedGuides.clear();
      
      // 重置所有引导时清理步骤引擎
      this.stepExecutor.reset();
      this.stepNavigation.reset();
      this.stepStateManager.reset();
      
      this.state.currentGuide = null;
      this.state.currentStep = 0;
      this.state.isActive = false;
      this.state.isPaused = false;
      
      this.log('All guides reset');
    }
    
    this.emit('guideReset', guideId);
    
    if (this.options.autoSave) {
      await this.saveState();
    }
  }
  
  /**
   * 获取当前状态
   */
  getState() {
    return { ...this.state };
  }
  
  /**
   * 获取引导配置
   * @param {string} guideId - 引导ID
   */
  getGuide(guideId) {
    return this.guides.get(guideId);
  }
  
  /**
   * 保存状态到存储
   */
  async saveState() {
    try {
      const stateToSave = {
        completedGuides: Array.from(this.state.completedGuides),
        skippedGuides: Array.from(this.state.skippedGuides),
        currentGuide: this.state.currentGuide,
        currentStep: this.state.currentStep,
        isActive: this.state.isActive,
        isPaused: this.state.isPaused
      };
      
      const result = await this.storage.save(stateToSave);
      this.log('State saved to storage');
      return result;
    } catch (error) {
      this.handleError('Failed to save state', error);
      return false;
    }
  }
  
  /**
   * 错误处理
   * @param {string} message - 错误消息
   * @param {Error} error - 错误对象
   */
  handleError(message, error = null) {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    this.log(`ERROR: ${errorMessage}`, 'error');
    this.emit('error', { message, error });
    
    if (this.options.debug) {
      console.error(message, error);
    }
  }
  
  /**
   * 日志记录
   * @param {string} message - 日志消息
   * @param {string} level - 日志级别
   */
  log(message, level = 'info') {
    if (this.options.debug) {
      console.log(`[OnboardingManager ${level.toUpperCase()}] ${message}`);
    }
    this.emit('log', { level, message });
  }
}