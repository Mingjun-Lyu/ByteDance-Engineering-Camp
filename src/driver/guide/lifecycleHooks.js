/**
 * 引导生命周期钩子和事件系统
 * 提供完整的引导生命周期管理
 */

import guideRegistry from './guideRegistry';
import { getGuideConfig } from './configManager';

/**
 * 引导生命周期钩子管理器
 */
class LifecycleHooks {
  constructor() {
    this.globalHooks = new Map();
    this.setupDefaultHooks();
  }

  /**
   * 设置默认钩子
   */
  setupDefaultHooks() {
    // 默认引导开始前钩子
    this.addGlobalHook('beforeStart', async (guideId) => {
      console.log(`引导开始前: ${guideId}`);
      
      // 可以在这里添加权限检查、数据预加载等
      const hasPermission = await this.checkPermissions(guideId);
      if (!hasPermission) {
        throw new Error(`没有权限执行引导: ${guideId}`);
      }
    });

    // 默认引导开始后钩子
    this.addGlobalHook('afterStart', async (guideId) => {
      console.log(`引导开始后: ${guideId}`);
      
      // 记录引导开始事件
      this.recordAnalyticsEvent('guide_started', {
        guideId,
        startTime: Date.now()
      });
    });

    // 默认步骤前钩子
    this.addGlobalHook('beforeStep', async (guideId, stepIndex) => {
      console.log(`步骤开始前: ${guideId}, 步骤: ${stepIndex}`);
      
      // 检查步骤元素是否存在
      const elementExists = await this.checkStepElement(guideId, stepIndex);
      if (!elementExists) {
        throw new Error(`步骤 ${stepIndex} 的目标元素不存在`);
      }
    });

    // 默认步骤后钩子
    this.addGlobalHook('afterStep', async (guideId, stepIndex) => {
      console.log(`步骤完成后: ${guideId}, 步骤: ${stepIndex}`);
      
      // 标记步骤完成
      guideRegistry.markStepCompleted(guideId, stepIndex);
      
      // 记录步骤完成事件
      this.recordAnalyticsEvent('step_completed', {
        guideId,
        stepIndex,
        timestamp: Date.now()
      });
    });

    // 默认引导完成前钩子
    this.addGlobalHook('beforeFinish', async (guideId) => {
      console.log(`引导完成前: ${guideId}`);
      
      // 可以在这里添加确认对话框
      const shouldFinish = await this.showCompletionConfirmation(guideId);
      if (!shouldFinish) {
        throw new Error('用户取消引导完成');
      }
    });

    // 默认引导完成后钩子
    this.addGlobalHook('afterFinish', async (guideId) => {
      console.log(`引导完成后: ${guideId}`);
      
      // 记录引导完成事件
      this.recordAnalyticsEvent('guide_completed', {
        guideId,
        completionType: 'normal',
        timestamp: Date.now()
      });
      
      // 保存引导完成状态
      this.saveGuideCompletion(guideId);
    });
  }

  /**
   * 添加全局钩子
   */
  addGlobalHook(hookType, hookFunction) {
    if (!this.globalHooks.has(hookType)) {
      this.globalHooks.set(hookType, []);
    }
    
    this.globalHooks.get(hookType).push(hookFunction);
    
    return () => this.removeGlobalHook(hookType, hookFunction);
  }

  /**
   * 移除全局钩子
   */
  removeGlobalHook(hookType, hookFunction) {
    if (!this.globalHooks.has(hookType)) return;
    
    const hooks = this.globalHooks.get(hookType);
    const index = hooks.indexOf(hookFunction);
    
    if (index > -1) {
      hooks.splice(index, 1);
    }
  }

  /**
   * 执行全局钩子
   */
  async executeGlobalHooks(hookType, guideId, stepIndex, state) {
    if (!this.globalHooks.has(hookType)) {
      return;
    }
    
    const hooks = this.globalHooks.get(hookType);
    
    for (const hook of hooks) {
      try {
        await hook(guideId, stepIndex, state);
      } catch (error) {
        console.error(`全局钩子执行错误 (${hookType}):`, error);
        throw error; // 传播错误
      }
    }
  }

  /**
   * 检查权限
   */
  async checkPermissions(guideId) {
    return this._checkPermissions(guideId);
  }

  /**
   * 检查引导权限
   */
  checkGuidePermissions(guideId) {
    // 检查用户权限
    const userPermissions = this._getUserPermissions();
    const guideConfig = getGuideConfig(guideId);
    
    if (guideConfig && guideConfig.permissions) {
      return this._hasRequiredPermissions(userPermissions, guideConfig.permissions);
    }
    
    return true;
  }

  /**
   * 检查步骤元素
   */
  checkStepElement(guideId, stepIndex) {
    const guideConfig = getGuideConfig(guideId);
    
    if (guideConfig && guideConfig.steps[stepIndex]) {
      const step = guideConfig.steps[stepIndex];
      return this._isElementAvailable(step.target);
    }
    
    return false;
  }

  /**
   * 显示完成确认
   */
  async showCompletionConfirmation() {
    // 这里可以实现确认对话框
    // 默认返回true
    return true;
  }

  /**
   * 确认步骤完成
   */
  confirmStepCompletion() {
    // 可以添加确认对话框或其他交互
    return Promise.resolve(true);
  }

  /**
   * 记录分析事件
   */
  recordAnalyticsEvent(eventType, data) {
    // 集成分析服务
    if (this.analyticsEnabled) {
      this._sendToAnalytics(eventType, data);
    }
  }

  /**
   * 保存引导完成状态
   */
  saveGuideCompletion(guideId) {
    // 这里可以实现引导完成状态的持久化
    // 例如：保存到localStorage、发送到服务器等
    
    const completionKey = `guide_completed_${guideId}`;
    localStorage.setItem(completionKey, JSON.stringify({
      completed: true,
      timestamp: Date.now()
    }));
  }

  /**
   * 检查引导是否已完成
   */
  isGuideCompleted(guideId) {
    const completionKey = `guide_completed_${guideId}`;
    const completionData = localStorage.getItem(completionKey);
    
    if (completionData) {
      try {
        const data = JSON.parse(completionData);
        return data.completed === true;
      } catch {
        return false;
      }
    }
    
    return false;
  }

  /**
   * 重置引导完成状态
   */
  resetGuideCompletion(guideId) {
    const completionKey = `guide_completed_${guideId}`;
    localStorage.removeItem(completionKey);
  }

  /**
   * 获取引导完成统计
   */
  getCompletionStatistics() {
    const statistics = {
      total: 0,
      completed: 0,
      completionRate: 0
    };
    
    // 这里可以实现更复杂的统计逻辑
    // 简化实现
    
    return statistics;
  }

  /**
   * 添加自定义事件监听器
   */
  addEventListener(eventType, listener, options = {}) {
    const { guideId = null } = options;
    
    if (guideId) {
      // 特定引导的事件
      return guideRegistry.addEventListener(guideId, eventType, listener);
    } else {
      // 全局事件
      // 这里可以实现全局事件系统
      console.warn('全局事件系统尚未实现');
      return () => {};
    }
  }

  /**
   * 触发自定义事件
   */
  emitEvent(eventType, data, options = {}) {
    const { guideId = null } = options;
    
    if (guideId) {
      guideRegistry.emitEvent(guideId, eventType, data);
    } else {
      // 全局事件
      console.log(`全局事件: ${eventType}`, data);
    }
  }

  /**
   * 创建引导进度监控
   */
  createProgressMonitor(guideId) {
    let lastProgress = 0;
    
    const monitor = {
      getProgress: () => {
        const progress = guideRegistry.getCompletionProgress(guideId);
        return progress;
      },
      
      onProgressChange: (callback) => {
        return guideRegistry.addEventListener(guideId, 'stepChanged', () => {
          const progress = guideRegistry.getCompletionProgress(guideId);
          
          if (progress.percentage !== lastProgress) {
            callback(progress);
            lastProgress = progress.percentage;
          }
        });
      },
      
      isCompleted: () => {
        const progress = guideRegistry.getCompletionProgress(guideId);
        return progress.percentage === 100;
      }
    };
    
    return monitor;
  }

  /**
   * 创建引导性能监控
   */
  createPerformanceMonitor(guideId) {
    const startTime = Date.now();
    let stepTimes = [];
    
    const monitor = {
      startStep: (stepIndex) => {
        stepTimes[stepIndex] = {
          start: Date.now(),
          end: null,
          duration: null
        };
      },
      
      endStep: (stepIndex) => {
        if (stepTimes[stepIndex]) {
          stepTimes[stepIndex].end = Date.now();
          stepTimes[stepIndex].duration = 
            stepTimes[stepIndex].end - stepTimes[stepIndex].start;
        }
      },
      
      getStatistics: () => {
        const totalDuration = Date.now() - startTime;
        const completedSteps = stepTimes.filter(step => step && step.end).length;
        const averageStepTime = completedSteps > 0 
          ? stepTimes.reduce((sum, step) => sum + (step?.duration || 0), 0) / completedSteps
          : 0;
        
        return {
          totalDuration,
          completedSteps,
          averageStepTime,
          stepTimes: stepTimes.map((step, index) => ({
            stepIndex: index,
            ...step
          })).filter(step => step.start)
        };
      }
    };
    
    // 自动监听步骤变化
    guideRegistry.addEventListener(guideId, 'stepChanged', (data) => {
      if (data.changeType === 'next') {
        monitor.startStep(data.stepIndex);
      }
    });
    
    return monitor;
  }

  /**
   * 销毁生命周期管理器
   */
  destroy() {
    this.globalHooks.clear();
    console.log('生命周期管理器已销毁');
  }
}

// 创建单例实例
const lifecycleHooks = new LifecycleHooks();

export default lifecycleHooks;