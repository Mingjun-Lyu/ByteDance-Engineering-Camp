/**
 * 引导逻辑模块主入口
 * 实现与页面业务解耦的引导架构
 */

import guideManager from './guideManager';
import guideRegistry from './guideRegistry';
import persistenceManager from './persistence';
import lifecycleHooks from './lifecycleHooks';
import { guideValidator, errorHandler } from './validation';
import { 
  registerGuide, 
  getGuideConfig, 
  getAllGuideConfigs, 
  hasGuideConfig, 
  unregisterGuide,
  updateGuideConfig,
  loadGuideFromJSON,
  exportGuideConfig,
  checkGuideConditions,
  getAvailableGuides
} from './configManager';

/**
 * 引导模块主类
 */
class GuideModule {
  constructor() {
    this.initialized = false;
    this.modules = {
      manager: guideManager,
      registry: guideRegistry,
      persistence: persistenceManager,
      lifecycle: lifecycleHooks,
      validator: guideValidator,
      errorHandler: errorHandler
    };
  }

  /**
   * 初始化引导模块
   */
  async initialize(options = {}) {
    if (this.initialized) {
      console.warn('引导模块已经初始化');
      return;
    }

    const {
      autoRestore = true,
      enablePersistence = true,
      enableLifecycleHooks = true
    } = options;

    try {
      // 初始化各个模块
      if (enablePersistence) {
        if (autoRestore) {
          await persistenceManager.restoreAllStates();
        }
      }

      if (enableLifecycleHooks) {
        // 生命周期钩子已自动设置
      }

      // 初始化引导管理器
      guideManager.initialize();

      this.initialized = true;
      
      console.log('引导模块初始化完成');
      
      return true;
    } catch (error) {
      console.error('引导模块初始化失败:', error);
      throw error;
    }
  }

  /**
   * 启动引导
   */
  async startGuide(guideId, options = {}) {
    this.ensureInitialized();
    
    try {
      return await guideManager.startGuide(guideId, options);
    } catch (error) {
      const guideError = errorHandler.createGuideError(
        error.message,
        guideId,
        'execution',
        { operation: 'startGuide', options }
      );
      
      throw guideError;
    }
  }

  /**
   * 停止当前引导
   */
  async stopCurrentGuide() {
    this.ensureInitialized();
    
    try {
      await guideManager.stopCurrentGuide();
    } catch (error) {
      const guideError = errorHandler.createGuideError(
        error.message,
        guideManager.getCurrentGuideId(),
        'execution',
        { operation: 'stopCurrentGuide' }
      );
      
      throw guideError;
    }
  }

  /**
   * 暂停当前引导
   */
  pauseCurrentGuide() {
    this.ensureInitialized();
    guideManager.pauseCurrentGuide();
  }

  /**
   * 恢复暂停的引导
   */
  resumeCurrentGuide() {
    this.ensureInitialized();
    guideManager.resumeCurrentGuide();
  }

  /**
   * 注册引导配置
   */
  registerGuide(config) {
    try {
      // 验证配置
      const validationErrors = guideValidator.validateGuideConfig(config);
      
      if (validationErrors.length > 0) {
        const errorReport = guideValidator.createValidationReport(config, validationErrors);
        throw new Error(`引导配置验证失败: ${JSON.stringify(errorReport.errors)}`);
      }
      
      return registerGuide(config);
    } catch (error) {
      const validationError = errorHandler.createGuideError(
        error.message,
        config.id,
        'validation',
        { operation: 'registerGuide', config }
      );
      
      throw validationError;
    }
  }

  /**
   * 批量注册引导配置
   */
  batchRegister(configs) {
    return guideRegistry.batchRegister(configs);
  }

  /**
   * 从JSON文件加载引导配置
   */
  async loadGuideFromJSON(jsonUrl) {
    try {
      return await loadGuideFromJSON(jsonUrl);
    } catch (error) {
      const guideError = errorHandler.createGuideError(
        error.message,
        null,
        'initialization',
        { operation: 'loadGuideFromJSON', jsonUrl }
      );
      
      throw guideError;
    }
  }

  /**
   * 获取引导配置
   */
  getGuideConfig(guideId) {
    return getGuideConfig(guideId);
  }

  /**
   * 获取所有引导配置
   */
  getAllGuideConfigs() {
    return getAllGuideConfigs();
  }

  /**
   * 获取可用的引导
   */
  getAvailableGuides() {
    return getAvailableGuides();
  }

  /**
   * 检查引导条件
   */
  checkGuideConditions(guideId) {
    return checkGuideConditions(guideId);
  }

  /**
   * 更新引导配置
   */
  updateGuideConfig(guideId, updates) {
    try {
      return updateGuideConfig(guideId, updates);
    } catch (error) {
      const guideError = errorHandler.createGuideError(
        error.message,
        guideId,
        'validation',
        { operation: 'updateGuideConfig', updates }
      );
      
      throw guideError;
    }
  }

  /**
   * 取消注册引导
   */
  unregisterGuide(guideId) {
    try {
      guideManager.stopCurrentGuide();
      return unregisterGuide(guideId);
    } catch (error) {
      const guideError = errorHandler.createGuideError(
        error.message,
        guideId,
        'execution',
        { operation: 'unregisterGuide' }
      );
      
      throw guideError;
    }
  }

  /**
   * 批量取消注册引导
   */
  batchUnregister(guideIds) {
    return guideRegistry.batchUnregister(guideIds);
  }

  /**
   * 获取引导状态
   */
  getGuideState(guideId) {
    return guideRegistry.getGuideState(guideId);
  }

  /**
   * 获取完成进度
   */
  getCompletionProgress(guideId) {
    return guideRegistry.getCompletionProgress(guideId);
  }

  /**
   * 获取引导统计信息
   */
  getStatistics() {
    return guideManager.getStatistics();
  }

  /**
   * 获取状态统计
   */
  getStateStatistics() {
    return persistenceManager.getStateStatistics();
  }

  /**
   * 导出引导配置
   */
  exportGuideConfig(guideId) {
    return exportGuideConfig(guideId);
  }

  /**
   * 导出引导状态
   */
  exportGuideState(guideId) {
    return persistenceManager.exportGuideState(guideId);
  }

  /**
   * 导入引导状态
   */
  importGuideState(importData) {
    return persistenceManager.importGuideState(importData);
  }

  /**
   * 保存引导状态
   */
  saveGuideState(guideId) {
    return persistenceManager.saveGuideState(guideId);
  }

  /**
   * 恢复引导状态
   */
  restoreGuideState(guideId) {
    return persistenceManager.restoreGuideState(guideId);
  }

  /**
   * 清理过期状态
   */
  cleanupExpiredStates(expiryDays = 30) {
    return persistenceManager.cleanupExpiredStates(expiryDays);
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType, listener, options = {}) {
    return lifecycleHooks.addEventListener(eventType, listener, options);
  }

  /**
   * 添加错误监听器
   */
  onError(callback) {
    return errorHandler.onError(callback);
  }

  /**
   * 创建进度监控
   */
  createProgressMonitor(guideId) {
    return lifecycleHooks.createProgressMonitor(guideId);
  }

  /**
   * 创建性能监控
   */
  createPerformanceMonitor(guideId) {
    return lifecycleHooks.createPerformanceMonitor(guideId);
  }

  /**
   * 检查引导是否已完成
   */
  isGuideCompleted(guideId) {
    return lifecycleHooks.isGuideCompleted(guideId);
  }

  /**
   * 重置引导完成状态
   */
  resetGuideCompletion(guideId) {
    return lifecycleHooks.resetGuideCompletion(guideId);
  }

  /**
   * 验证引导配置
   */
  validateGuideConfig(config) {
    const errors = guideValidator.validateGuideConfig(config);
    return guideValidator.createValidationReport(config, errors);
  }

  /**
   * 获取当前引导ID
   */
  getCurrentGuideId() {
    return guideManager.getCurrentGuideId();
  }

  /**
   * 检查引导是否在运行
   */
  isGuideRunning(guideId) {
    return guideManager.isGuideRunning(guideId);
  }

  /**
   * 获取所有引导实例
   */
  getAllInstances() {
    return guideRegistry.getAllInstances();
  }

  /**
   * 获取活跃的引导实例
   */
  getActiveInstances() {
    return guideRegistry.getActiveInstances();
  }

  /**
   * 设置持久化选项
   */
  setPersistenceOptions(options) {
    if (options.autoSave !== undefined) {
      persistenceManager.setAutoSave(
        options.autoSave, 
        options.autoSaveInterval
      );
    }
  }

  /**
   * 确保模块已初始化
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('引导模块未初始化，请先调用 initialize() 方法');
    }
  }

  /**
   * 销毁引导模块
   */
  destroy() {
    try {
      guideManager.destroy();
      persistenceManager.destroy();
      lifecycleHooks.destroy();
      guideRegistry.cleanup();
      
      this.initialized = false;
      
      console.log('引导模块已销毁');
    } catch (error) {
      console.error('引导模块销毁失败:', error);
    }
  }

  /**
   * 获取模块版本信息
   */
  getVersionInfo() {
    return {
      module: 'guide-module',
      version: '1.0.0',
      features: [
        '配置管理',
        '注册机制',
        '生命周期管理',
        '状态持久化',
        '错误处理',
        '验证系统'
      ]
    };
  }
}

// 创建单例实例
const guideModule = new GuideModule();

// 导出主要功能
const {
  initialize,
  startGuide,
  stopCurrentGuide,
  getGuideState,
  getCompletionProgress,
  addEventListener,
  onError,
  destroy
} = guideModule;

export {
  guideModule as default,
  initialize,
  startGuide,
  stopCurrentGuide,
  getGuideState,
  getCompletionProgress,
  addEventListener,
  onError,
  destroy
};

// 导出所有模块供高级使用
export {
  guideManager,
  guideRegistry,
  persistenceManager,
  lifecycleHooks,
  guideValidator,
  errorHandler
};

// 导出配置管理函数
export {
  registerGuide,
  getGuideConfig,
  getAllGuideConfigs,
  hasGuideConfig,
  unregisterGuide,
  updateGuideConfig,
  loadGuideFromJSON,
  exportGuideConfig,
  checkGuideConditions,
  getAvailableGuides
};

// 导出错误类
export { ValidationError, GuideError } from './validation';