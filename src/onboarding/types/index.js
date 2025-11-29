/**
 * 引导系统类型定义
 */

/**
 * 引导步骤配置
 */
export const StepType = {
  INFO: 'info',
  ACTION: 'action', 
  INTERACTIVE: 'interactive'
};

/**
 * 元素定位方式
 */
export const LocatorType = {
  CSS_SELECTOR: 'css',
  DATA_ATTR: 'data',
  XPATH: 'xpath',
  COMPONENT: 'component'
};

/**
 * 引导配置接口
 */
export class GuideConfig {
  constructor(config) {
    this.id = config.id;
    this.name = config.name || config.id;
    this.description = config.description || '';
    this.steps = config.steps || [];
    this.conditions = config.conditions || [];
    this.options = config.options || {};
  }
}

/**
 * 步骤配置接口
 */
export class StepConfig {
  constructor(config) {
    this.id = config.id;
    this.title = config.title || '';
    this.content = config.content || '';
    this.type = config.type || StepType.INFO;
    this.target = config.target || null;
    this.actions = config.actions || [];
    this.conditions = config.conditions || [];
    this.position = config.position || 'auto';
  }
}

/**
 * 目标元素配置
 */
export class TargetConfig {
  constructor(config) {
    this.type = config.type || LocatorType.CSS_SELECTOR;
    this.selector = config.selector || '';
    this.component = config.component || '';
    this.fallback = config.fallback || [];
  }
}

/**
 * 条件配置
 */
export class ConditionConfig {
  constructor(config) {
    this.type = config.type || 'function';
    this.expression = config.expression || '';
    this.validator = config.validator || null;
  }
}

/**
 * 管理器选项
 */
export class ManagerOptions {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'onboarding_state';
    this.autoSave = options.autoSave !== false;
    this.debug = options.debug || false;
    this.storageType = options.storageType || 'localStorage';
  }
}