/**
 * 配置验证器
 * 验证引导配置的完整性和正确性
 */
export class ConfigValidator {
  /**
   * 验证引导配置
   * @param {Object} config - 引导配置
   * @returns {ValidationResult}
   */
  static validateGuide(config) {
    const errors = [];
    const warnings = [];
    
    // 必需字段检查
    if (!config.id) {
      errors.push('Guide ID is required');
    }
    
    if (!config.name) {
      warnings.push('Guide name is recommended');
    }
    
    // 步骤检查
    if (!config.steps || !Array.isArray(config.steps)) {
      errors.push('Steps must be an array');
    } else if (config.steps.length === 0) {
      errors.push('At least one step is required');
    } else {
      // 验证每个步骤
      config.steps.forEach((step, index) => {
        const stepResult = this.validateStep(step, index);
        errors.push(...stepResult.errors);
        warnings.push(...stepResult.warnings);
      });
    }
    
    // ID格式检查
    if (config.id && !/^[a-z0-9_-]+$/.test(config.id)) {
      warnings.push('Guide ID should use lowercase letters, numbers, hyphens, and underscores only');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 验证步骤配置
   * @param {Object} step - 步骤配置
   * @param {number} index - 步骤索引
   * @returns {ValidationResult}
   */
  static validateStep(step, index) {
    const errors = [];
    const warnings = [];
    
    if (!step.id) {
      errors.push(`Step ${index}: ID is required`);
    }
    
    if (!step.title && !step.content) {
      warnings.push(`Step ${index}: Title or content is recommended`);
    }
    
    // 目标元素检查
    if (step.target) {
      const targetResult = this.validateTarget(step.target, index);
      errors.push(...targetResult.errors);
      warnings.push(...targetResult.warnings);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 验证目标配置
   * @param {Object} target - 目标配置
   * @param {number} stepIndex - 步骤索引
   * @returns {ValidationResult}
   */
  static validateTarget(target, stepIndex) {
    const errors = [];
    const warnings = [];
    
    if (!target.type) {
      errors.push(`Step ${stepIndex}: Target type is required`);
    }
    
    if (!target.selector && !target.component) {
      errors.push(`Step ${stepIndex}: Target selector or component is required`);
    }
    
    // 根据类型验证选择器
    if (target.type === 'css' && !target.selector) {
      errors.push(`Step ${stepIndex}: CSS selector is required for css target type`);
    }
    
    if (target.type === 'component' && !target.component) {
      errors.push(`Step ${stepIndex}: Component name is required for component target type`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 验证条件配置
   * @param {Object} condition - 条件配置
   * @param {string} context - 上下文信息
   * @returns {ValidationResult}
   */
  static validateCondition(condition, context = '') {
    const errors = [];
    const warnings = [];
    
    if (!condition.type) {
      errors.push(`${context}: Condition type is required`);
    }
    
    if (!condition.expression && !condition.validator) {
      errors.push(`${context}: Condition expression or validator is required`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 批量验证配置
   * @param {Array} configs - 配置数组
   * @returns {BatchValidationResult}
   */
  static validateBatch(configs) {
    const results = [];
    let allValid = true;
    
    configs.forEach((config, index) => {
      const result = this.validateGuide(config);
      results.push({
        config: config,
        index: index,
        ...result
      });
      
      if (!result.isValid) {
        allValid = false;
      }
    });
    
    return {
      allValid,
      results
    };
  }
}

/**
 * 验证结果类型
 */
export class ValidationResult {
  constructor(isValid = true, errors = [], warnings = []) {
    this.isValid = isValid;
    this.errors = errors;
    this.warnings = warnings;
  }
}

/**
 * 批量验证结果类型
 */
export class BatchValidationResult {
  constructor(allValid = true, results = []) {
    this.allValid = allValid;
    this.results = results;
  }
}