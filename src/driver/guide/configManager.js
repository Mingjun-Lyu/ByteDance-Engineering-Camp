/**
 * 引导配置管理器
 * 支持JSON配置和注册机制，实现与页面业务解耦
 */

// 配置相关功能已通过其他方式实现

// 引导配置存储
const guideConfigs = new Map();

// 默认配置模板
const DEFAULT_GUIDE_CONFIG = {
  id: '',
  name: '',
  description: '',
  version: '1.0.0',
  enabled: true,
  autoStart: false,
  showProgress: true,
  allowClose: true,
  overlayOpacity: 0.7,
  smoothScroll: false,
  steps: [],
  conditions: {
    required: [],
    optional: []
  },
  hooks: {
    beforeStart: null,
    afterStart: null,
    beforeStep: null,
    afterStep: null,
    beforeFinish: null,
    afterFinish: null
  }
};

/**
 * 验证引导配置
 */
function validateGuideConfig(config) {
  const errors = [];
  
  if (!config.id || typeof config.id !== 'string') {
    errors.push('引导配置必须包含有效的id字段');
  }
  
  if (!config.name || typeof config.name !== 'string') {
    errors.push('引导配置必须包含有效的name字段');
  }
  
  if (!Array.isArray(config.steps)) {
    errors.push('steps字段必须是数组');
  } else {
    config.steps.forEach((step, index) => {
      if (!step.element && !step.position) {
        errors.push(`步骤 ${index + 1} 必须包含element或position字段`);
      }
      
      if (step.element && typeof step.element !== 'string') {
        errors.push(`步骤 ${index + 1} 的element字段必须是字符串选择器`);
      }
    });
  }
  
  return errors;
}

/**
 * 注册引导配置
 */
export function registerGuide(config) {
  const validationErrors = validateGuideConfig(config);
  
  if (validationErrors.length > 0) {
    throw new Error(`引导配置验证失败: ${validationErrors.join(', ')}`);
  }
  
  const mergedConfig = {
    ...DEFAULT_GUIDE_CONFIG,
    ...config,
    steps: config.steps.map(step => ({
      ...step,
      id: step.id || `${config.id}-step-${config.steps.indexOf(step)}`
    }))
  };
  
  guideConfigs.set(config.id, mergedConfig);
  
  console.log(`引导配置已注册: ${config.id} (${config.name})`);
  
  return mergedConfig;
}

/**
 * 获取引导配置
 */
export function getGuideConfig(guideId) {
  const config = guideConfigs.get(guideId);
  
  if (!config) {
    throw new Error(`引导配置不存在: ${guideId}`);
  }
  
  return { ...config };
}

/**
 * 获取所有引导配置
 */
export function getAllGuideConfigs() {
  return Array.from(guideConfigs.values());
}

/**
 * 检查引导配置是否存在
 */
export function hasGuideConfig(guideId) {
  return guideConfigs.has(guideId);
}

/**
 * 取消注册引导配置
 */
export function unregisterGuide(guideId) {
  if (!guideConfigs.has(guideId)) {
    console.warn(`尝试取消注册不存在的引导配置: ${guideId}`);
    return false;
  }
  
  guideConfigs.delete(guideId);
  console.log(`引导配置已取消注册: ${guideId}`);
  return true;
}

/**
 * 更新引导配置
 */
export function updateGuideConfig(guideId, updates) {
  if (!guideConfigs.has(guideId)) {
    throw new Error(`引导配置不存在: ${guideId}`);
  }
  
  const currentConfig = guideConfigs.get(guideId);
  const updatedConfig = {
    ...currentConfig,
    ...updates,
    id: guideId // 确保id不被修改
  };
  
  const validationErrors = validateGuideConfig(updatedConfig);
  
  if (validationErrors.length > 0) {
    throw new Error(`引导配置更新验证失败: ${validationErrors.join(', ')}`);
  }
  
  guideConfigs.set(guideId, updatedConfig);
  
  return updatedConfig;
}

/**
 * 从JSON文件加载引导配置
 */
export async function loadGuideFromJSON(jsonUrl) {
  try {
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      throw new Error(`加载JSON文件失败: ${response.status}`);
    }
    
    const configs = await response.json();
    
    // 支持单个配置或配置数组
    const configArray = Array.isArray(configs) ? configs : [configs];
    
    const results = [];
    
    for (const config of configArray) {
      try {
        const registeredConfig = registerGuide(config);
        results.push({
          success: true,
          config: registeredConfig
        });
      } catch (error) {
        results.push({
          success: false,
          config,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    throw new Error(`加载引导配置失败: ${error.message}`);
  }
}

/**
 * 导出引导配置为JSON
 */
export function exportGuideConfig(guideId) {
  const config = getGuideConfig(guideId);
  
  // 移除内部使用的字段
  const exportableConfig = { ...config };
  
  return JSON.stringify(exportableConfig, null, 2);
}

/**
 * 检查引导条件是否满足
 */
export function checkGuideConditions(guideId) {
  const config = getGuideConfig(guideId);
  const { conditions } = config;
  
  const results = {
    required: [],
    optional: [],
    allRequiredMet: true,
    anyOptionalMet: conditions.optional.length === 0
  };
  
  // 检查必需条件
  conditions.required.forEach(condition => {
    const isMet = evaluateCondition(condition);
    results.required.push({
      condition,
      met: isMet
    });
    
    if (!isMet) {
      results.allRequiredMet = false;
    }
  });
  
  // 检查可选条件
  conditions.optional.forEach(condition => {
    const isMet = evaluateCondition(condition);
    results.optional.push({
      condition,
      met: isMet
    });
    
    if (isMet) {
      results.anyOptionalMet = true;
    }
  });
  
  return results;
}

/**
 * 评估单个条件
 */
function evaluateCondition(condition) {
  if (typeof condition === 'function') {
    return condition();
  }
  
  if (typeof condition === 'string') {
    // 元素存在性检查
    return !!document.querySelector(condition);
  }
  
  if (condition && typeof condition === 'object') {
    // 复杂条件对象
    if (condition.type === 'elementExists') {
      return !!document.querySelector(condition.selector);
    }
    
    if (condition.type === 'localStorage') {
      const value = localStorage.getItem(condition.key);
      return condition.expectedValue ? value === condition.expectedValue : !!value;
    }
    
    if (condition.type === 'cookie') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${condition.key}=`))
        ?.split('=')[1];
      
      return condition.expectedValue ? cookieValue === condition.expectedValue : !!cookieValue;
    }
  }
  
  return false;
}

/**
 * 获取满足条件的引导配置
 */
export function getAvailableGuides() {
  const allConfigs = getAllGuideConfigs();
  
  return allConfigs.filter(config => {
    if (!config.enabled) return false;
    
    const conditionResults = checkGuideConditions(config.id);
    
    return conditionResults.allRequiredMet && conditionResults.anyOptionalMet;
  });
}

export default {
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