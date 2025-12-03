/**
 * guide 引导系统 - 统一入口文件
 * 提供挂载即用的引导功能，支持JSON配置
 */

// 导入核心引导功能
import { driver } from './core/driver';

// 导出核心引导功能
export { driver } from './core/driver';

// 导出引导组件
export { default as GuidePanel } from './components/GuidePanel';
export { default as GuideManager } from './components/GuideManager';

// 导出工具函数
export { configure, getConfig } from './utils/config';
export { getState, setState, resetState } from './utils/state';

// 默认配置
export const defaultGuideConfig = {
  title: '新手引导',
  description: '欢迎使用本系统，让我们开始引导吧！',
  steps: [],
  config: {
    animate: true,
    allowClose: true,
    overlayClickBehavior: 'close',
    showProgress: true,
    showButtons: ['next', 'previous', 'close']
  }
};

/**
 * 快速启动引导
 * @param {Object} options - 引导配置选项
 * @returns {Object} 引导实例
 */
export function quickStartGuide(options = {}) {
  const mergedConfig = {
    ...defaultGuideConfig,
    ...options
  };
  
  const guideDriver = driver({
    ...mergedConfig.config,
    steps: mergedConfig.steps
  });
  
  return guideDriver;
}

/**
 * 挂载引导面板到页面
 * @param {Object} _props - 引导面板属性（保留参数用于未来扩展）
 */
export function mountGuidePanel(_props = {}) {
  if (typeof document === 'undefined') return;
  
  // 创建挂载点
  let mountPoint = document.getElementById('guide-mount-point');
  if (!mountPoint) {
    mountPoint = document.createElement('div');
    mountPoint.id = 'guide-mount-point';
    document.body.appendChild(mountPoint);
  }
  
  // 这里需要ReactDOM来渲染组件
  // 在实际使用中，应用应该使用React组件方式引入
  console.log('Guide mount point created. Use GuideManager component in your React app.');
  
  // 使用参数避免未使用警告
  if (_props) {
    // 保留参数用于未来扩展
  }
}