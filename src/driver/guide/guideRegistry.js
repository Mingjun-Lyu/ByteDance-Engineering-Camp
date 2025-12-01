/**
 * 引导注册器
 * 支持动态注册和取消注册引导步骤，实现与页面业务解耦
 */

import { getGuideConfig, registerGuide, unregisterGuide } from './configManager';

// 引导实例存储
const guideInstances = new Map();

// 引导状态存储
const guideStates = new Map();

// 引导事件监听器
const eventListeners = new Map();

/**
 * 引导注册器类
 */
class GuideRegistry {
  constructor() {
    this.instances = guideInstances;
    this.states = guideStates;
    this.listeners = eventListeners;
  }

  /**
   * 注册引导实例
   */
  registerInstance(guideId, instance) {
    if (!guideId || !instance) {
      throw new Error('引导ID和实例不能为空');
    }

    // 验证引导配置是否存在
    if (!getGuideConfig(guideId)) {
      throw new Error(`引导配置不存在: ${guideId}`);
    }

    guideInstances.set(guideId, instance);
    
    // 初始化引导状态
    this.initializeGuideState(guideId);
    
    console.log(`引导实例已注册: ${guideId}`);
    
    return instance;
  }

  /**
   * 获取引导实例
   */
  getInstance(guideId) {
    const instance = guideInstances.get(guideId);
    
    if (!instance) {
      throw new Error(`引导实例不存在: ${guideId}`);
    }
    
    return instance;
  }

  /**
   * 检查引导实例是否存在
   */
  hasInstance(guideId) {
    return guideInstances.has(guideId);
  }

  /**
   * 取消注册引导实例
   */
  unregisterInstance(guideId) {
    if (!guideInstances.has(guideId)) {
      console.warn(`尝试取消注册不存在的引导实例: ${guideId}`);
      return false;
    }

    // 停止正在运行的引导
    const instance = guideInstances.get(guideId);
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }

    // 清理状态和监听器
    guideStates.delete(guideId);
    this.removeAllEventListeners(guideId);
    guideInstances.delete(guideId);
    
    console.log(`引导实例已取消注册: ${guideId}`);
    
    return true;
  }

  /**
   * 初始化引导状态
   */
  initializeGuideState(guideId) {
    const config = getGuideConfig(guideId);
    
    guideStates.set(guideId, {
      guideId,
      status: 'idle', // idle, running, paused, completed, stopped
      currentStepIndex: -1,
      startTime: null,
      endTime: null,
      completedSteps: new Set(),
      userInteractions: [],
      metadata: {},
      version: config.version
    });
  }

  /**
   * 获取引导状态
   */
  getGuideState(guideId) {
    const state = guideStates.get(guideId);
    
    if (!state) {
      throw new Error(`引导状态不存在: ${guideId}`);
    }
    
    return { ...state };
  }

  /**
   * 更新引导状态
   */
  updateGuideState(guideId, updates) {
    if (!guideStates.has(guideId)) {
      throw new Error(`引导状态不存在: ${guideId}`);
    }

    const currentState = guideStates.get(guideId);
    const newState = {
      ...currentState,
      ...updates
    };

    guideStates.set(guideId, newState);
    
    // 触发状态变化事件
    this.emitEvent(guideId, 'stateChanged', newState);
    
    return newState;
  }

  /**
   * 记录用户交互
   */
  recordUserInteraction(guideId, interaction) {
    const state = this.getGuideState(guideId);
    
    const interactionRecord = {
      ...interaction,
      timestamp: Date.now(),
      stepIndex: state.currentStepIndex
    };
    
    state.userInteractions.push(interactionRecord);
    
    this.updateGuideState(guideId, {
      userInteractions: state.userInteractions
    });
    
    this.emitEvent(guideId, 'userInteraction', interactionRecord);
  }

  /**
   * 标记步骤完成
   */
  markStepCompleted(guideId, stepIndex) {
    const state = this.getGuideState(guideId);
    
    state.completedSteps.add(stepIndex);
    
    this.updateGuideState(guideId, {
      completedSteps: new Set(state.completedSteps)
    });
  }

  /**
   * 检查步骤是否完成
   */
  isStepCompleted(guideId, stepIndex) {
    const state = this.getGuideState(guideId);
    return state.completedSteps.has(stepIndex);
  }

  /**
   * 获取完成进度
   */
  getCompletionProgress(guideId) {
    const config = getGuideConfig(guideId);
    const state = this.getGuideState(guideId);
    
    const totalSteps = config.steps.length;
    const completedSteps = state.completedSteps.size;
    
    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    };
  }

  /**
   * 添加事件监听器
   */
  addEventListener(guideId, eventType, listener) {
    if (!eventListeners.has(guideId)) {
      eventListeners.set(guideId, new Map());
    }

    const guideListeners = eventListeners.get(guideId);
    
    if (!guideListeners.has(eventType)) {
      guideListeners.set(eventType, new Set());
    }

    guideListeners.get(eventType).add(listener);
    
    return () => this.removeEventListener(guideId, eventType, listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(guideId, eventType, listener) {
    if (!eventListeners.has(guideId)) return;

    const guideListeners = eventListeners.get(guideId);
    
    if (guideListeners.has(eventType)) {
      guideListeners.get(eventType).delete(listener);
      
      if (guideListeners.get(eventType).size === 0) {
        guideListeners.delete(eventType);
      }
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllEventListeners(guideId) {
    eventListeners.delete(guideId);
  }

  /**
   * 触发事件
   */
  emitEvent(guideId, eventType, data) {
    if (!eventListeners.has(guideId)) return;

    const guideListeners = eventListeners.get(guideId);
    
    if (guideListeners.has(eventType)) {
      guideListeners.get(eventType).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`引导事件监听器执行错误 (${guideId}.${eventType}):`, error);
        }
      });
    }
  }

  /**
   * 批量注册引导配置
   */
  batchRegister(configs) {
    const results = [];
    
    for (const config of configs) {
      try {
        registerGuide(config);
        results.push({
          guideId: config.id,
          success: true
        });
      } catch (error) {
        results.push({
          guideId: config.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * 批量取消注册引导
   */
  batchUnregister(guideIds) {
    const results = [];
    
    for (const guideId of guideIds) {
      try {
        const instanceRemoved = this.unregisterInstance(guideId);
        const configRemoved = unregisterGuide(guideId);
        
        results.push({
          guideId,
          instanceRemoved,
          configRemoved
        });
      } catch (error) {
        results.push({
          guideId,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * 获取所有注册的引导实例
   */
  getAllInstances() {
    return Array.from(guideInstances.entries()).map(([guideId, instance]) => ({
      guideId,
      instance,
      state: this.getGuideState(guideId)
    }));
  }

  /**
   * 获取活跃的引导实例
   */
  getActiveInstances() {
    return this.getAllInstances().filter(item => 
      item.state.status === 'running' || item.state.status === 'paused'
    );
  }

  /**
   * 清理所有引导实例
   */
  cleanup() {
    const guideIds = Array.from(guideInstances.keys());
    
    guideIds.forEach(guideId => {
      this.unregisterInstance(guideId);
      unregisterGuide(guideId);
    });
    
    console.log('所有引导实例已清理');
  }
}

// 创建单例实例
const guideRegistry = new GuideRegistry();

export default guideRegistry;