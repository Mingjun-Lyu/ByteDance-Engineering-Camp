import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 步骤执行状态管理器
 * 负责步骤执行状态的跟踪、持久化和恢复
 */
export class StepStateManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // 配置选项
    this.options = {
      autoSave: true,
      saveInterval: 1000,
      maxStateHistory: 20,
      debug: false,
      ...options
    };
    
    // 执行状态
    this.state = {
      // 当前执行状态
      currentExecution: null,
      
      // 步骤执行历史
      executionHistory: [],
      
      // 步骤执行统计
      executionStats: new Map(),
      
      // 错误历史
      errorHistory: [],
      
      // 性能指标
      performanceMetrics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        totalExecutionTime: 0
      }
    };
    
    // 自动保存定时器
    this.autoSaveTimer = null;
    
    // 状态快照
    this.stateSnapshots = new Map();
    
    this.initialize();
    this.log('StepStateManager initialized');
  }
  
  /**
   * 初始化状态管理器
   */
  initialize() {
    // 启动自动保存（如果启用）
    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }
  
  /**
   * 开始步骤执行
   * @param {Object} step - 步骤配置
   * @param {Object} context - 执行上下文
   */
  startStepExecution(step, context = {}) {
    const executionId = this.generateExecutionId();
    
    const executionState = {
      id: executionId,
      step: { ...step },
      context: { ...context },
      status: 'running',
      startTime: Date.now(),
      endTime: null,
      duration: null,
      result: null,
      error: null,
      progress: 0
    };
    
    this.state.currentExecution = executionState;
    
    this.log(`Step execution started: ${step.id} (${executionId})`);
    this.emit('executionStarted', executionState);
    
    return executionId;
  }
  
  /**
   * 更新步骤执行进度
   * @param {string} executionId - 执行ID
   * @param {number} progress - 进度 (0-100)
   * @param {Object} data - 进度数据
   */
  updateExecutionProgress(executionId, progress, data = {}) {
    if (!this.state.currentExecution || this.state.currentExecution.id !== executionId) {
      return;
    }
    
    this.state.currentExecution.progress = Math.max(0, Math.min(100, progress));
    this.state.currentExecution.progressData = data;
    
    this.emit('executionProgressUpdated', {
      executionId,
      progress,
      data
    });
  }
  
  /**
   * 完成步骤执行
   * @param {string} executionId - 执行ID
   * @param {Object} result - 执行结果
   */
  completeStepExecution(executionId, result = {}) {
    if (!this.state.currentExecution || this.state.currentExecution.id !== executionId) {
      throw new Error(`No active execution found for ID: ${executionId}`);
    }
    
    const execution = this.state.currentExecution;
    execution.status = 'completed';
    execution.endTime = Date.now();
    execution.duration = execution.endTime - execution.startTime;
    execution.result = result;
    execution.progress = 100;
    
    // 更新执行历史
    this.addToExecutionHistory(execution);
    
    // 更新性能指标
    this.updatePerformanceMetrics(execution, true);
    
    // 更新步骤统计
    this.updateStepStats(execution.step.id, execution, true);
    
    this.state.currentExecution = null;
    
    this.log(`Step execution completed: ${execution.step.id} (${execution.duration}ms)`);
    this.emit('executionCompleted', execution);
    
    return execution;
  }
  
  /**
   * 失败步骤执行
   * @param {string} executionId - 执行ID
   * @param {Error} error - 错误对象
   */
  failStepExecution(executionId, error) {
    if (!this.state.currentExecution || this.state.currentExecution.id !== executionId) {
      throw new Error(`No active execution found for ID: ${executionId}`);
    }
    
    const execution = this.state.currentExecution;
    execution.status = 'failed';
    execution.endTime = Date.now();
    execution.duration = execution.endTime - execution.startTime;
    execution.error = error;
    
    // 添加到执行历史
    this.addToExecutionHistory(execution);
    
    // 添加到错误历史
    this.addToErrorHistory(execution, error);
    
    // 更新性能指标
    this.updatePerformanceMetrics(execution, false);
    
    // 更新步骤统计
    this.updateStepStats(execution.step.id, execution, false);
    
    this.state.currentExecution = null;
    
    this.log(`Step execution failed: ${execution.step.id} - ${error.message}`, 'error');
    this.emit('executionFailed', { execution, error });
    
    return execution;
  }
  
  /**
   * 暂停步骤执行
   * @param {string} executionId - 执行ID
   */
  pauseStepExecution(executionId) {
    if (!this.state.currentExecution || this.state.currentExecution.id !== executionId) {
      return;
    }
    
    this.state.currentExecution.status = 'paused';
    this.state.currentExecution.pauseTime = Date.now();
    
    this.log(`Step execution paused: ${this.state.currentExecution.step.id}`);
    this.emit('executionPaused', this.state.currentExecution);
  }
  
  /**
   * 恢复步骤执行
   * @param {string} executionId - 执行ID
   */
  resumeStepExecution(executionId) {
    if (!this.state.currentExecution || this.state.currentExecution.id !== executionId) {
      return;
    }
    
    this.state.currentExecution.status = 'running';
    
    // 计算暂停时间
    if (this.state.currentExecution.pauseTime) {
      const pauseDuration = Date.now() - this.state.currentExecution.pauseTime;
      this.state.currentExecution.pauseDuration = (this.state.currentExecution.pauseDuration || 0) + pauseDuration;
      delete this.state.currentExecution.pauseTime;
    }
    
    this.log(`Step execution resumed: ${this.state.currentExecution.step.id}`);
    this.emit('executionResumed', this.state.currentExecution);
  }
  
  /**
   * 取消步骤执行
   * @param {string} executionId - 执行ID
   * @param {string} reason - 取消原因
   */
  cancelStepExecution(executionId, reason = 'User cancelled') {
    if (!this.state.currentExecution || this.state.currentExecution.id !== executionId) {
      return;
    }
    
    const execution = this.state.currentExecution;
    execution.status = 'cancelled';
    execution.endTime = Date.now();
    execution.duration = execution.endTime - execution.startTime;
    execution.cancelReason = reason;
    
    this.state.currentExecution = null;
    
    this.log(`Step execution cancelled: ${execution.step.id} - ${reason}`);
    this.emit('executionCancelled', execution);
  }
  
  /**
   * 添加入执行历史
   */
  addToExecutionHistory(execution) {
    this.state.executionHistory.unshift(execution);
    
    // 限制历史记录大小
    if (this.state.executionHistory.length > this.options.maxStateHistory) {
      this.state.executionHistory.pop();
    }
    
    this.emit('executionHistoryUpdated', {
      history: [...this.state.executionHistory]
    });
  }
  
  /**
   * 添加错误历史
   */
  addToErrorHistory(execution, error) {
    const errorRecord = {
      executionId: execution.id,
      stepId: execution.step.id,
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      execution
    };
    
    this.state.errorHistory.unshift(errorRecord);
    
    // 限制错误历史大小
    if (this.state.errorHistory.length > this.options.maxStateHistory) {
      this.state.errorHistory.pop();
    }
    
    this.emit('errorHistoryUpdated', {
      errors: [...this.state.errorHistory]
    });
  }
  
  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(execution, success) {
    const metrics = this.state.performanceMetrics;
    
    metrics.totalExecutions++;
    
    if (success) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }
    
    metrics.totalExecutionTime += execution.duration;
    metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.totalExecutions;
    
    this.emit('performanceMetricsUpdated', { metrics: { ...metrics } });
  }
  
  /**
   * 更新步骤统计
   */
  updateStepStats(stepId, execution, success) {
    if (!this.state.executionStats.has(stepId)) {
      this.state.executionStats.set(stepId, {
        stepId,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastExecution: null
      });
    }
    
    const stats = this.state.executionStats.get(stepId);
    stats.totalExecutions++;
    
    if (success) {
      stats.successfulExecutions++;
    } else {
      stats.failedExecutions++;
    }
    
    stats.totalExecutionTime += execution.duration;
    stats.averageExecutionTime = stats.totalExecutionTime / stats.totalExecutions;
    stats.lastExecution = execution;
    
    this.emit('stepStatsUpdated', { stepId, stats: { ...stats } });
  }
  
  /**
   * 创建状态快照
   * @param {string} snapshotId - 快照ID
   */
  createSnapshot(snapshotId) {
    const snapshot = {
      id: snapshotId,
      timestamp: Date.now(),
      state: {
        executionHistory: [...this.state.executionHistory],
        executionStats: new Map(this.state.executionStats),
        errorHistory: [...this.state.errorHistory],
        performanceMetrics: { ...this.state.performanceMetrics }
      }
    };
    
    this.stateSnapshots.set(snapshotId, snapshot);
    
    this.log(`State snapshot created: ${snapshotId}`);
    this.emit('snapshotCreated', snapshot);
    
    return snapshot;
  }
  
  /**
   * 恢复状态快照
   * @param {string} snapshotId - 快照ID
   */
  restoreSnapshot(snapshotId) {
    const snapshot = this.stateSnapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }
    
    // 恢复状态
    this.state.executionHistory = [...snapshot.state.executionHistory];
    this.state.executionStats = new Map(snapshot.state.executionStats);
    this.state.errorHistory = [...snapshot.state.errorHistory];
    this.state.performanceMetrics = { ...snapshot.state.performanceMetrics };
    
    this.log(`State snapshot restored: ${snapshotId}`);
    this.emit('snapshotRestored', snapshot);
    
    return snapshot;
  }
  
  /**
   * 获取当前执行状态
   */
  getCurrentExecution() {
    return this.state.currentExecution ? { ...this.state.currentExecution } : null;
  }
  
  /**
   * 获取执行历史
   */
  getExecutionHistory() {
    return [...this.state.executionHistory];
  }
  
  /**
   * 获取错误历史
   */
  getErrorHistory() {
    return [...this.state.errorHistory];
  }
  
  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return { ...this.state.performanceMetrics };
  }
  
  /**
   * 获取步骤统计
   * @param {string} stepId - 步骤ID（可选）
   */
  getStepStats(stepId = null) {
    if (stepId) {
      return this.state.executionStats.get(stepId) || null;
    }
    
    return Object.fromEntries(this.state.executionStats);
  }
  
  /**
   * 获取完整状态
   */
  getFullState() {
    return {
      currentExecution: this.getCurrentExecution(),
      executionHistory: this.getExecutionHistory(),
      errorHistory: this.getErrorHistory(),
      performanceMetrics: this.getPerformanceMetrics(),
      executionStats: this.getStepStats()
    };
  }
  
  /**
   * 生成执行ID
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 启动自动保存
   */
  startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
      this.saveState();
    }, this.options.saveInterval);
    
    this.log('Auto-save started');
  }
  
  /**
   * 停止自动保存
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      this.log('Auto-save stopped');
    }
  }
  
  /**
   * 保存状态（用于持久化）
   */
  saveState() {
    // 这里可以集成存储系统进行状态持久化
    const stateToSave = this.getFullState();
    
    this.emit('stateSaved', { state: stateToSave });
    
    if (this.options.debug) {
      this.log('State saved');
    }
  }
  
  /**
   * 重置状态管理器
   */
  reset() {
    this.state = {
      currentExecution: null,
      executionHistory: [],
      executionStats: new Map(),
      errorHistory: [],
      performanceMetrics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        totalExecutionTime: 0
      }
    };
    
    this.stateSnapshots.clear();
    
    this.log('State manager reset');
    this.emit('stateReset');
  }
  
  /**
   * 销毁状态管理器
   */
  destroy() {
    this.stopAutoSave();
    this.reset();
    
    this.log('State manager destroyed');
    this.emit('destroyed');
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
      console.log(`[StepStateManager ${level.toUpperCase()}] ${message}`);
    }
    this.emit('log', { level, message });
  }
}