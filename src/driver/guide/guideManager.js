/**
 * 引导管理器
 * 统一管理所有引导流程，实现与页面业务解耦
 */

import { driver } from '../driver';
import guideRegistry from './guideRegistry';
import { getGuideConfig, getAvailableGuides, checkGuideConditions } from './configManager';

/**
 * 引导管理器类
 */
class GuideManager {
  constructor() {
    this.currentGuideId = null;
    this.autoStartQueue = [];
    this.initialized = false;
  }

  /**
   * 初始化引导管理器
   */
  initialize() {
    if (this.initialized) {
      console.warn('引导管理器已经初始化');
      return;
    }

    this.initialized = true;
    
    // 设置全局错误处理
    this.setupErrorHandling();
    
    // 检查自动启动的引导
    this.checkAutoStartGuides();
    
    console.log('引导管理器初始化完成');
  }

  /**
   * 设置错误处理
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && event.error.message.includes('guide')) {
        console.error('引导管理器错误:', event.error);
        this.emitGlobalEvent('error', {
          type: 'global',
          error: event.error,
          timestamp: Date.now()
        });
      }
    });

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('guide')) {
        console.error('引导管理器Promise错误:', event.reason);
        this.emitGlobalEvent('error', {
          type: 'promise',
          error: event.reason,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * 启动引导
   */
  async startGuide(guideId, options = {}) {
    if (!this.initialized) {
      this.initialize();
    }

    // 检查是否已有引导在运行
    if (this.currentGuideId && this.isGuideRunning(this.currentGuideId)) {
      if (options.force) {
        await this.stopCurrentGuide();
      } else {
        throw new Error(`已有引导在运行: ${this.currentGuideId}`);
      }
    }

    // 验证引导配置
    const config = getGuideConfig(guideId);
    
    // 检查条件是否满足
    const conditionResults = checkGuideConditions(guideId);
    if (!conditionResults.allRequiredMet) {
      throw new Error(`引导条件不满足: ${guideId}`);
    }

    // 创建引导实例
    const driverOptions = this.buildDriverOptions(config, options);
    const driverInstance = driver(driverOptions);
    
    // 注册引导实例
    guideRegistry.registerInstance(guideId, driverInstance);
    
    // 更新引导状态
    guideRegistry.updateGuideState(guideId, {
      status: 'running',
      startTime: Date.now(),
      currentStepIndex: -1
    });

    this.currentGuideId = guideId;

    // 执行前置钩子
    await this.executeHook(config.hooks.beforeStart, guideId, -1);

    // 启动引导
    driverInstance.drive(options.startStep || 0);

    // 执行后置钩子
    await this.executeHook(config.hooks.afterStart, guideId, -1);

    // 设置引导事件监听
    this.setupGuideEventListeners(guideId, driverInstance);

    guideRegistry.emitEvent(guideId, 'guideStarted', {
      guideId,
      startTime: Date.now(),
      startStep: options.startStep || 0
    });

    return driverInstance;
  }

  /**
   * 构建driver选项
   */
  buildDriverOptions(config, userOptions) {
    const baseOptions = {
      steps: config.steps,
      allowClose: config.allowClose,
      overlayOpacity: config.overlayOpacity,
      smoothScroll: config.smoothScroll,
      showProgress: config.showProgress,
      onNextClick: () => {
        this.handleStepChange(config.id, this._getCurrentStepIndex(), 'next');
      },
      onPrevClick: () => {
        this.handleStepChange(config.id, this._getCurrentStepIndex(), 'previous');
      },
      onDeselected: () => {
        this.handleStepDeselected(config.id, this._getCurrentStepIndex());
      },
      onDestroyStarted: () => {
        return this.handleGuideStop(config.id, 'user');
      },
      onDestroyed: () => {
        this.handleGuideCompleted(config.id, 'completed');
      }
    };

    return {
      ...baseOptions,
      ...userOptions
    };
  }

  /**
   * 设置引导事件监听器
   */
  setupGuideEventListeners(guideId, driverInstance) {
    // 监听步骤变化
    const originalDrive = driverInstance.drive;
    driverInstance.drive = (stepIndex) => {
      const result = originalDrive.call(driverInstance, stepIndex);
      this.handleStepChange(guideId, stepIndex, 'programmatic');
      return result;
    };

    // 监听移动操作
    const originalMoveNext = driverInstance.moveNext;
    driverInstance.moveNext = () => {
      const result = originalMoveNext.call(driverInstance);
      this.handleStepChange(guideId, driverInstance.getActiveIndex(), 'next');
      return result;
    };

    const originalMovePrevious = driverInstance.movePrevious;
    driverInstance.movePrevious = () => {
      const result = originalMovePrevious.call(driverInstance);
      this.handleStepChange(guideId, driverInstance.getActiveIndex(), 'previous');
      return result;
    };
  }

  /**
   * 处理步骤变化
   */
  async handleStepChange(guideId, stepIndex, changeType) {
    const config = getGuideConfig(guideId);
    const state = guideRegistry.getGuideState(guideId);
    
    // 更新当前步骤索引
    guideRegistry.updateGuideState(guideId, {
      currentStepIndex: stepIndex
    });

    // 记录用户交互
    guideRegistry.recordUserInteraction(guideId, {
      type: 'stepChange',
      changeType,
      fromStep: state.currentStepIndex,
      toStep: stepIndex
    });

    // 执行步骤钩子
    if (changeType === 'next') {
      await this.executeHook(config.hooks.beforeStep, guideId, stepIndex);
    }

    guideRegistry.emitEvent(guideId, 'stepChanged', {
      guideId,
      stepIndex,
      changeType,
      timestamp: Date.now()
    });

    if (changeType === 'next') {
      await this.executeHook(config.hooks.afterStep, guideId, stepIndex);
    }
  }

  /**
   * 处理步骤取消选择
   */
  handleStepDeselected(guideId, stepIndex) {
    guideRegistry.recordUserInteraction(guideId, {
      type: 'stepDeselected',
      stepIndex
    });

    guideRegistry.emitEvent(guideId, 'stepDeselected', {
      guideId,
      stepIndex,
      timestamp: Date.now()
    });
  }

  /**
   * 处理引导停止
   */
  _handleGuideStop() {
    const guideId = this.currentGuideId;
    
    if (guideId) {
      this.lifecycleHooks.triggerEvent('guide:stop', { guideId });
      this._cleanupCurrentGuide();
    }
  }

  /**
   * 处理引导完成
   */
  async handleGuideCompleted(guideId, completionType) {
    const config = getGuideConfig(guideId);
    const state = guideRegistry.getGuideState(guideId);
    
    // 标记所有步骤完成
    config.steps.forEach((_, index) => {
      guideRegistry.markStepCompleted(guideId, index);
    });

    // 更新引导状态
    guideRegistry.updateGuideState(guideId, {
      status: completionType === 'completed' ? 'completed' : 'stopped',
      endTime: Date.now()
    });

    // 执行后置完成钩子
    await this.executeHook(config.hooks.afterFinish, guideId, -1);

    guideRegistry.emitEvent(guideId, 'guideCompleted', {
      guideId,
      completionType,
      duration: Date.now() - state.startTime,
      timestamp: Date.now()
    });

    this.currentGuideId = null;
  }

  /**
   * 确认引导停止
   */
  async confirmGuideStop() {
    // 这里可以实现确认对话框逻辑
    // 默认允许停止
    return true;
  }

  /**
   * 执行钩子函数
   */
  async executeHook(hook, guideId, stepIndex) {
    if (typeof hook === 'function') {
      try {
        await hook(guideId, stepIndex, guideRegistry.getGuideState(guideId));
      } catch (error) {
        console.error(`引导钩子执行错误 (${guideId}, step ${stepIndex}):`, error);
        guideRegistry.emitEvent(guideId, 'hookError', {
          guideId,
          stepIndex,
          error,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * 停止当前引导
   */
  async stopCurrentGuide() {
    if (!this.currentGuideId) {
      return;
    }

    const instance = guideRegistry.getInstance(this.currentGuideId);
    
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }

    await this.handleGuideCompleted(this.currentGuideId, 'stopped');
  }

  /**
   * 暂停当前引导
   */
  pauseCurrentGuide() {
    if (!this.currentGuideId) {
      return;
    }

    const state = guideRegistry.getGuideState(this.currentGuideId);
    
    if (state.status === 'running') {
      guideRegistry.updateGuideState(this.currentGuideId, {
        status: 'paused'
      });

      guideRegistry.emitEvent(this.currentGuideId, 'guidePaused', {
        guideId: this.currentGuideId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 恢复暂停的引导
   */
  resumeCurrentGuide() {
    if (!this.currentGuideId) {
      return;
    }

    const state = guideRegistry.getGuideState(this.currentGuideId);
    
    if (state.status === 'paused') {
      guideRegistry.updateGuideState(this.currentGuideId, {
        status: 'running'
      });

      guideRegistry.emitEvent(this.currentGuideId, 'guideResumed', {
        guideId: this.currentGuideId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 检查引导是否在运行
   */
  isGuideRunning(guideId) {
    try {
      const state = guideRegistry.getGuideState(guideId);
      return state.status === 'running';
    } catch {
      return false;
    }
  }

  /**
   * 获取当前引导ID
   */
  getCurrentGuideId() {
    return this.currentGuideId;
  }

  /**
   * 检查自动启动的引导
   */
  checkAutoStartGuides() {
    const availableGuides = getAvailableGuides();
    
    availableGuides.forEach(config => {
      if (config.autoStart && !this.isGuideRunning(config.id)) {
        this.autoStartQueue.push(config.id);
      }
    });

    // 延迟启动，确保页面完全加载
    if (this.autoStartQueue.length > 0) {
      setTimeout(() => {
        this.processAutoStartQueue();
      }, 1000);
    }
  }

  /**
   * 处理自动启动队列
   */
  async processAutoStartQueue() {
    for (const guideId of this.autoStartQueue) {
      try {
        await this.startGuide(guideId);
        console.log(`自动启动引导: ${guideId}`);
      } catch (error) {
        console.error(`自动启动引导失败: ${guideId}`, error);
      }
    }
    
    this.autoStartQueue = [];
  }

  /**
   * 获取引导统计信息
   */
  getStatistics() {
    const allInstances = guideRegistry.getAllInstances();
    
    return {
      totalGuides: allInstances.length,
      activeGuides: allInstances.filter(i => 
        i.state.status === 'running' || i.state.status === 'paused'
      ).length,
      completedGuides: allInstances.filter(i => i.state.status === 'completed').length,
      guidesByStatus: allInstances.reduce((acc, instance) => {
        acc[instance.state.status] = (acc[instance.state.status] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * 触发全局事件
   */
  emitGlobalEvent(eventType, data) {
    // 这里可以实现全局事件系统
    console.log(`全局事件: ${eventType}`, data);
  }

  /**
   * 销毁引导管理器
   */
  destroy() {
    this.stopCurrentGuide();
    guideRegistry.cleanup();
    this.initialized = false;
    this.currentGuideId = null;
    this.autoStartQueue = [];
    
    console.log('引导管理器已销毁');
  }
}

// 创建单例实例
const guideManager = new GuideManager();

export default guideManager;