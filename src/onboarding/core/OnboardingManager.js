import { EventEmitter } from '../utils/EventEmitter.js';
import { StorageManager } from '../storage/StorageManager.js';

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
        this.state = { ...this.state, ...savedState };
        this.log('State restored from storage');
      }
      
      this.emit('initialized', this.state);
    } catch (error) {
      this.handleError('Failed to initialize', error);
    }
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
   * 暂停引导
   */
  async pauseGuide() {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }
    
    this.state.isPaused = true;
    this.log('Guide paused');
    this.emit('guidePaused', this.state);
    
    if (this.options.autoSave) {
      await this.saveState();
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
    this.emit('guideResumed', this.state);
  }
  
  /**
   * 完成当前步骤并进入下一步
   */
  async completeStep() {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }
    
    const guide = this.guides.get(this.state.currentGuide);
    if (!guide) {
      this.handleError('Current guide not found');
      return;
    }
    
    const currentStep = this.state.currentStep;
    const nextStep = currentStep + 1;
    
    // 检查是否还有下一步
    if (nextStep >= guide.steps.length) {
      await this.completeGuide();
      return;
    }
    
    // 更新到下一步
    this.state.currentStep = nextStep;
    this.log(`Step completed, moving to step ${nextStep}`);
    this.emit('stepCompleted', { 
      guideId: this.state.currentGuide, 
      step: currentStep,
      nextStep 
    });
    
    if (this.options.autoSave) {
      await this.saveState();
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
    this.state.completedGuides.add(guideId);
    this.state.isActive = false;
    this.state.currentGuide = null;
    this.state.currentStep = null;
    
    this.log(`Guide completed: ${guideId}`);
    this.emit('guideCompleted', guideId);
    
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
      this.log(`Guide reset: ${guideId}`);
    } else {
      this.state.completedGuides.clear();
      this.state.skippedGuides.clear();
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
      
      await this.storage.save(stateToSave);
      this.log('State saved to storage');
    } catch (error) {
      this.handleError('Failed to save state', error);
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