/**
 * 引导配置验证和错误处理机制
 */

/**
 * 验证错误类
 */
class ValidationError extends Error {
  constructor(message, field, value, rule) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.rule = rule;
    this.timestamp = Date.now();
  }
}

/**
 * 引导错误类
 */
class GuideError extends Error {
  constructor(message, guideId, errorType, context) {
    super(message);
    this.name = 'GuideError';
    this.guideId = guideId;
    this.errorType = errorType;
    this.context = context;
    this.timestamp = Date.now();
  }
}

/**
 * 验证规则定义
 */
const VALIDATION_RULES = {
  required: (value, field) => {
    if (value === undefined || value === null || value === '') {
      return `${field} 字段是必需的`;
    }
    return null;
  },
  
  string: (value, field) => {
    if (value && typeof value !== 'string') {
      return `${field} 字段必须是字符串`;
    }
    return null;
  },
  
  boolean: (value, field) => {
    if (value && typeof value !== 'boolean') {
      return `${field} 字段必须是布尔值`;
    }
    return null;
  },
  
  number: (value, field) => {
    if (value && typeof value !== 'number') {
      return `${field} 字段必须是数字`;
    }
    return null;
  },
  
  array: (value, field) => {
    if (value && !Array.isArray(value)) {
      return `${field} 字段必须是数组`;
    }
    return null;
  },
  
  object: (value, field) => {
    if (value && (typeof value !== 'object' || Array.isArray(value))) {
      return `${field} 字段必须是对象`;
    }
    return null;
  },
  
  function: (value, field) => {
    if (value && typeof value !== 'function') {
      return `${field} 字段必须是函数`;
    }
    return null;
  },
  
  minLength: (value, field, min) => {
    if (value && value.length < min) {
      return `${field} 字段长度不能小于 ${min}`;
    }
    return null;
  },
  
  maxLength: (value, field, max) => {
    if (value && value.length > max) {
      return `${field} 字段长度不能大于 ${max}`;
    }
    return null;
  },
  
  min: (value, field, min) => {
    if (value !== undefined && value !== null && value < min) {
      return `${field} 字段值不能小于 ${min}`;
    }
    return null;
  },
  
  max: (value, field, max) => {
    if (value !== undefined && value !== null && value > max) {
      return `${field} 字段值不能大于 ${max}`;
    }
    return null;
  },
  
  inRange: (value, field, range) => {
    if (value !== undefined && value !== null && (value < range[0] || value > range[1])) {
      return `${field} 字段值必须在 ${range[0]} 到 ${range[1]} 之间`;
    }
    return null;
  },
  
  oneOf: (value, field, allowedValues) => {
    if (value && !allowedValues.includes(value)) {
      return `${field} 字段必须是以下值之一: ${allowedValues.join(', ')}`;
    }
    return null;
  },
  
  pattern: (value, field, pattern) => {
    if (value && !pattern.test(value)) {
      return `${field} 字段格式不正确`;
    }
    return null;
  },
  
  validSelector: (value, field) => {
    if (value) {
      try {
        // 简单的选择器验证
        document.createElement('div').querySelector(value);
      } catch {
        return `${field} 字段包含无效的选择器: ${value}`;
      }
    }
    return null;
  }
};

/**
 * 引导配置验证器
 */
class GuideValidator {
  constructor() {
    this.rules = VALIDATION_RULES;
  }

  /**
   * 验证引导配置
   */
  validateGuideConfig(config) {
    const errors = [];
    
    // 基础字段验证
    errors.push(...this.validateBasicFields(config));
    
    // 步骤验证
    if (config.steps) {
      errors.push(...this.validateSteps(config.steps));
    }
    
    // 条件验证
    if (config.conditions) {
      errors.push(...this.validateConditions(config.conditions));
    }
    
    // 钩子验证
    if (config.hooks) {
      errors.push(...this.validateHooks(config.hooks));
    }
    
    return errors;
  }

  /**
   * 验证基础字段
   */
  validateBasicFields(config) {
    const errors = [];
    const rules = {
      id: [['required'], ['string'], ['minLength', 1]],
      name: [['required'], ['string'], ['minLength', 1]],
      description: [['string']],
      version: [['string'], ['pattern', /^\d+\.\d+\.\d+$/]],
      enabled: [['boolean']],
      autoStart: [['boolean']],
      showProgress: [['boolean']],
      allowClose: [['boolean']],
      overlayOpacity: [['number'], ['inRange', [0, 1]]],
      smoothScroll: [['boolean']]
    };
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = config[field];
      
      for (const rule of fieldRules) {
        const [ruleName, ...ruleParams] = rule;
        const error = this.applyRule(ruleName, value, field, ruleParams);
        
        if (error) {
          errors.push(new ValidationError(error, field, value, ruleName));
          break; // 每个字段只报告第一个错误
        }
      }
    }
    
    return errors;
  }

  /**
   * 验证步骤
   */
  validateSteps(steps) {
    const errors = [];
    
    if (!Array.isArray(steps)) {
      errors.push(new ValidationError('steps字段必须是数组', 'steps', steps, 'array'));
      return errors;
    }
    
    if (steps.length === 0) {
      errors.push(new ValidationError('steps数组不能为空', 'steps', steps, 'minLength'));
      return errors;
    }
    
    steps.forEach((step, index) => {
      const stepErrors = this.validateStep(step, index);
      errors.push(...stepErrors);
    });
    
    return errors;
  }

  /**
   * 验证单个步骤
   */
  validateStep(step, index) {
    const errors = [];
    const stepPrefix = `steps[${index}]`;
    
    // 检查必需字段
    if (!step.element && !step.position) {
      errors.push(new ValidationError(
        '步骤必须包含element或position字段',
        `${stepPrefix}.element/position`,
        step,
        'required'
      ));
    }
    
    // 验证element字段
    if (step.element) {
      const elementError = this.applyRule('validSelector', step.element, `${stepPrefix}.element`);
      if (elementError) {
        errors.push(new ValidationError(elementError, `${stepPrefix}.element`, step.element, 'validSelector'));
      }
    }
    
    // 验证position字段
    if (step.position) {
      const positionRules = [['object']];
      
      for (const rule of positionRules) {
        const [ruleName, ...ruleParams] = rule;
        const error = this.applyRule(ruleName, step.position, `${stepPrefix}.position`, ruleParams);
        
        if (error) {
          errors.push(new ValidationError(error, `${stepPrefix}.position`, step.position, ruleName));
          break;
        }
      }
    }
    
    // 验证popover字段
    if (step.popover) {
      const popoverErrors = this.validatePopover(step.popover, `${stepPrefix}.popover`);
      errors.push(...popoverErrors);
    }
    
    return errors;
  }

  /**
   * 验证弹窗配置
   */
  validatePopover(popover, fieldPrefix) {
    const errors = [];
    const popoverRules = {
      title: [['string']],
      description: [['string']],
      showButtons: [['array']],
      disableButtons: [['array']],
      onNextClick: [['function']],
      onPrevClick: [['function']],
      onCloseClick: [['function']],
      showProgress: [['boolean']],
      progressText: [['string']]
    };
    
    for (const [field, fieldRules] of Object.entries(popoverRules)) {
      const value = popover[field];
      
      for (const rule of fieldRules) {
        const [ruleName, ...ruleParams] = rule;
        const error = this.applyRule(ruleName, value, `${fieldPrefix}.${field}`, ruleParams);
        
        if (error) {
          errors.push(new ValidationError(error, `${fieldPrefix}.${field}`, value, ruleName));
          break;
        }
      }
    }
    
    return errors;
  }

  /**
   * 验证条件
   */
  validateConditions(conditions) {
    const errors = [];
    
    if (conditions.required && !Array.isArray(conditions.required)) {
      errors.push(new ValidationError('conditions.required必须是数组', 'conditions.required', conditions.required, 'array'));
    }
    
    if (conditions.optional && !Array.isArray(conditions.optional)) {
      errors.push(new ValidationError('conditions.optional必须是数组', 'conditions.optional', conditions.optional, 'array'));
    }
    
    return errors;
  }

  /**
   * 验证钩子
   */
  validateHooks(hooks) {
    const errors = [];
    const hookFields = ['beforeStart', 'afterStart', 'beforeStep', 'afterStep', 'beforeFinish', 'afterFinish'];
    
    for (const hookField of hookFields) {
      const value = hooks[hookField];
      
      if (value && typeof value !== 'function') {
        errors.push(new ValidationError(
          `hooks.${hookField}必须是函数`,
          `hooks.${hookField}`,
          value,
          'function'
        ));
      }
    }
    
    return errors;
  }

  /**
   * 应用验证规则
   */
  applyRule(ruleName, value, field, params = []) {
    if (!this.rules[ruleName]) {
      return `未知的验证规则: ${ruleName}`;
    }
    
    return this.rules[ruleName](value, field, ...params);
  }

  /**
   * 格式化验证错误
   */
  formatValidationErrors(errors) {
    return errors.map(error => ({
      message: error.message,
      field: error.field,
      value: error.value,
      rule: error.rule,
      timestamp: error.timestamp
    }));
  }

  /**
   * 创建验证报告
   */
  createValidationReport(config, errors) {
    return {
      valid: errors.length === 0,
      errorCount: errors.length,
      errors: this.formatValidationErrors(errors),
      config: {
        id: config.id,
        name: config.name,
        stepCount: config.steps ? config.steps.length : 0
      },
      timestamp: Date.now()
    };
  }
}

/**
 * 错误处理器
 */
class ErrorHandler {
  constructor() {
    this.errorCallbacks = new Set();
    this.setupGlobalErrorHandling();
  }

  /**
   * 设置全局错误处理
   */
  setupGlobalErrorHandling() {
    // 捕获同步错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error);
    });

    // 捕获Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });
  }

  /**
   * 处理错误
   */
  handleError(error, context = {}) {
    const errorInfo = this.createErrorInfo(error, context);
    
    // 记录错误
    this.logError(errorInfo);
    
    // 触发错误回调
    this.triggerErrorCallbacks(errorInfo);
    
    // 根据错误类型决定是否抛出
    if (errorInfo.severity === 'fatal') {
      throw error;
    }
    
    return errorInfo;
  }

  /**
   * 创建错误信息
   */
  createErrorInfo(error, context) {
    const isValidationError = error instanceof ValidationError;
    const isGuideError = error instanceof GuideError;
    
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: Date.now(),
      severity: this.determineSeverity(error),
      type: isValidationError ? 'validation' : isGuideError ? 'guide' : 'unknown',
      context: {
        guideId: context.guideId || error.guideId,
        stepIndex: context.stepIndex,
        ...context
      },
      originalError: error
    };
  }

  /**
   * 确定错误严重程度
   */
  determineSeverity(error) {
    if (error instanceof ValidationError) {
      return 'error';
    }
    
    if (error instanceof GuideError) {
      switch (error.errorType) {
        case 'initialization':
        case 'execution':
          return 'error';
        case 'permission':
        case 'condition':
          return 'warning';
        default:
          return 'info';
      }
    }
    
    return 'error';
  }

  /**
   * 记录错误
   */
  logError(errorInfo) {
    const logMessage = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.message}`;
    
    switch (errorInfo.severity) {
      case 'fatal':
      case 'error':
        console.error(logMessage, errorInfo);
        break;
      case 'warning':
        console.warn(logMessage, errorInfo);
        break;
      default:
        console.log(logMessage, errorInfo);
    }
  }

  /**
   * 触发错误回调
   */
  triggerErrorCallbacks(errorInfo) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('错误回调执行失败:', callbackError);
      }
    });
  }

  /**
   * 添加错误回调
   */
  onError(callback) {
    this.errorCallbacks.add(callback);
    
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  /**
   * 创建引导错误
   */
  createGuideError(message, guideId, errorType, context) {
    return new GuideError(message, guideId, errorType, context);
  }

  /**
   * 创建验证错误
   */
  createValidationError(message, field, value, rule) {
    return new ValidationError(message, field, value, rule);
  }

  /**
   * 获取错误统计
   */
  getErrorStatistics() {
    // 这里可以实现错误统计功能
    return {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {}
    };
  }
}

// 创建单例实例
const guideValidator = new GuideValidator();
const errorHandler = new ErrorHandler();

export {
  guideValidator,
  errorHandler,
  ValidationError,
  GuideError
};

export default {
  validator: guideValidator,
  handler: errorHandler
};