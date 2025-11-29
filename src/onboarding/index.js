// onboarding 模块入口文件
import { OnboardingManager } from './core/OnboardingManager.js';
export { OnboardingManager } from './core/OnboardingManager.js';
export { StorageManager } from './storage/StorageManager.js';
export { EventEmitter } from './utils/EventEmitter.js';
export { useOnboarding } from './hooks/useOnboarding.js';

// 默认导出 OnboardingManager
export default OnboardingManager;