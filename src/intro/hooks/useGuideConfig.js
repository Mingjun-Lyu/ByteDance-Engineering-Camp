import { useState, useEffect } from 'react';

// 直接导入JSON配置文件
import homeGuideConfig from '../jsons/guide-config.json';

/**
 * 引导配置管理hook
 * 处理引导配置的加载、验证和增强
 */
const useGuideConfig = () => {
  const [guideConfig, setGuideConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 加载引导配置
   */
  const loadConfig = () => {
    try {
      setIsLoading(true);
      const config = homeGuideConfig;
      
      // 检查配置是否有效
      if (!config || !config.title || !config.steps) {
        throw new Error('引导配置文件格式错误或缺失必要字段');
      }
      
      // 为每个步骤添加step字段（如果不存在）
      const enhancedSteps = config.steps.map((step, index) => ({
        step: index + 1,
        ...step
      }));
      
      setGuideConfig({
        ...config,
        steps: enhancedSteps
      });
      setConfigError(null);
    } catch (error) {
      console.warn('Failed to load guide config:', error);
      setConfigError(error.message);
      setGuideConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 验证配置是否有效
   * @returns {boolean} 配置是否有效
   */
  const isValidConfig = () => {
    return !configError && guideConfig && guideConfig.steps && guideConfig.steps.length > 0;
  };

  /**
   * 获取指定步骤的配置
   * @param {number} stepIndex - 步骤索引
   * @returns {Object|null} 步骤配置
   */
  const getStepConfig = (stepIndex) => {
    if (!guideConfig || !guideConfig.steps || stepIndex >= guideConfig.steps.length) {
      return null;
    }
    return guideConfig.steps[stepIndex];
  };

  /**
   * 获取总步骤数
   * @returns {number} 总步骤数
   */
  const getTotalSteps = () => {
    return guideConfig?.steps?.length || 0;
  };

  // 组件挂载时加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  return {
    guideConfig,
    configError,
    isLoading,
    isValidConfig,
    getStepConfig,
    getTotalSteps,
    reloadConfig: loadConfig
  };
};

export default useGuideConfig;