/**
 * 引导模块基础使用示例
 */

import guideModule, { 
  registerGuide, 
  startGuide, 
  stopCurrentGuide,
  addEventListener,
  onError 
} from '../index.js';

/**
 * 示例1: 基础引导配置
 */
const basicGuideConfig = {
  id: 'basic-tutorial',
  name: '基础教程引导',
  description: '这是一个基础的使用示例',
  version: '1.0.0',
  
  steps: [
    {
      id: 'step-1',
      title: '欢迎使用',
      content: '欢迎来到我们的应用程序！',
      target: '#welcome-section',
      position: 'bottom',
      showButtons: true,
      showOverlay: true
    },
    {
      id: 'step-2',
      title: '导航菜单',
      content: '这是导航菜单，点击可以访问不同的功能',
      target: '.nav-menu',
      position: 'right',
      showButtons: true,
      showOverlay: true
    },
    {
      id: 'step-3',
      title: '主要功能',
      content: '这是应用程序的主要功能区域',
      target: '#main-content',
      position: 'top',
      showButtons: true,
      showOverlay: true
    }
  ],
  
  options: {
    allowClose: true,
    showProgress: true,
    keyboardNavigation: true,
    overlayClickToClose: true,
    animation: true
  }
};

/**
 * 示例2: 高级引导配置（带条件）
 */
const advancedGuideConfig = {
  id: 'advanced-tutorial',
  name: '高级功能引导',
  description: '演示高级功能的使用',
  version: '1.1.0',
  
  conditions: {
    required: ['#advanced-feature'],
    optional: ['.user-logged-in'],
    custom: () => {
      return localStorage.getItem('userLevel') === 'advanced';
    }
  },
  
  steps: [
    {
      id: 'step-1',
      title: '高级功能',
      content: '这是高级功能区域',
      target: '#advanced-feature',
      position: 'bottom',
      conditions: {
        required: ['#advanced-feature']
      }
    },
    {
      id: 'step-2',
      title: '设置选项',
      content: '在这里配置高级设置',
      target: '.settings-panel',
      position: 'left',
      onBeforeStep: () => {
        console.log('即将进入设置步骤');
        return true; // 返回false可阻止步骤继续
      }
    }
  ],
  
  options: {
    allowClose: false,
    showProgress: true,
    keyboardNavigation: true
  },
  
  hooks: {
    beforeStart: () => {
      console.log('高级引导即将开始');
      return true;
    },
    afterFinish: () => {
      console.log('高级引导已完成');
      // 可以在这里保存完成状态
      localStorage.setItem('advancedTutorialCompleted', 'true');
    }
  }
};

/**
 * 初始化引导模块
 */
async function initializeGuideModule() {
  try {
    await guideModule.initialize({
      autoRestore: true,
      autoStart: true,
      enablePersistence: true,
      enableLifecycleHooks: true
    });
    
    console.log('引导模块初始化成功');
    
    // 注册引导配置
    registerGuide(basicGuideConfig);
    registerGuide(advancedGuideConfig);
    
    console.log('引导配置注册完成');
    
    return true;
  } catch (error) {
    console.error('引导模块初始化失败:', error);
    return false;
  }
}

/**
 * 启动基础引导
 */
async function startBasicTutorial() {
  try {
    const result = await startGuide('basic-tutorial', {
      autoStart: true,
      forceRestart: false
    });
    
    console.log('基础引导启动成功:', result);
    return result;
  } catch (error) {
    console.error('基础引导启动失败:', error);
    throw error;
  }
}

/**
 * 启动高级引导
 */
async function startAdvancedTutorial() {
  try {
    // 检查条件
    const conditions = guideModule.checkGuideConditions('advanced-tutorial');
    
    if (conditions.valid) {
      const result = await startGuide('advanced-tutorial');
      console.log('高级引导启动成功:', result);
      return result;
    } else {
      console.warn('高级引导条件不满足:', conditions.errors);
      return null;
    }
  } catch (error) {
    console.error('高级引导启动失败:', error);
    throw error;
  }
}

/**
 * 添加事件监听器
 */
function setupEventListeners() {
  // 引导开始事件
  addEventListener('guide:start', (event) => {
    console.log('引导开始:', event.guideId);
  });
  
  // 步骤变化事件
  addEventListener('guide:stepChange', (event) => {
    console.log('步骤变化:', {
      guideId: event.guideId,
      from: event.fromStep,
      to: event.toStep
    });
  });
  
  // 引导完成事件
  addEventListener('guide:finish', (event) => {
    console.log('引导完成:', event.guideId);
  });
  
  // 引导停止事件
  addEventListener('guide:stop', (event) => {
    console.log('引导停止:', event.guideId);
  });
  
  // 错误事件监听
  onError((error) => {
    console.error('引导错误:', error);
  });
}

/**
 * 获取引导状态信息
 */
function getGuideStatus() {
  const basicState = guideModule.getGuideState('basic-tutorial');
  const advancedState = guideModule.getGuideState('advanced-tutorial');
  
  console.log('基础引导状态:', basicState);
  console.log('高级引导状态:', advancedState);
  
  const progress = guideModule.getCompletionProgress('basic-tutorial');
  console.log('基础引导进度:', progress);
  
  const statistics = guideModule.getStatistics();
  console.log('引导统计信息:', statistics);
}

/**
 * 演示完整使用流程
 */
async function demonstrateFullUsage() {
  // 1. 初始化
  const initialized = await initializeGuideModule();
  if (!initialized) return;
  
  // 2. 设置事件监听
  setupEventListeners();
  
  // 3. 启动基础引导
  await startBasicTutorial();
  
  // 4. 获取状态信息
  getGuideStatus();
  
  // 5. 等待一段时间后停止引导
  setTimeout(async () => {
    await stopCurrentGuide();
    console.log('引导已停止');
  }, 5000);
}

/**
 * 动态注册引导配置
 */
function registerDynamicGuide() {
  const dynamicConfig = {
    id: 'dynamic-tutorial',
    name: '动态引导',
    steps: [
      {
        id: 'step-1',
        title: '动态步骤',
        content: '这是动态创建的引导步骤',
        target: '#dynamic-element',
        position: 'bottom'
      }
    ]
  };
  
  guideModule.registerGuide(dynamicConfig);
  console.log('动态引导配置已注册');
}

/**
 * 批量操作示例
 */
function demonstrateBatchOperations() {
  const multipleGuides = [
    {
      id: 'guide-1',
      name: '引导1',
      steps: [{ id: 'step-1', title: '步骤1', target: '#elem1' }]
    },
    {
      id: 'guide-2', 
      name: '引导2',
      steps: [{ id: 'step-1', title: '步骤1', target: '#elem2' }]
    }
  ];
  
  // 批量注册
  guideModule.batchRegister(multipleGuides);
  
  // 批量取消注册
  guideModule.batchUnregister(['guide-1', 'guide-2']);
}

// 导出示例函数供外部使用
export {
  initializeGuideModule,
  startBasicTutorial,
  startAdvancedTutorial,
  demonstrateFullUsage,
  registerDynamicGuide,
  demonstrateBatchOperations
};

// 如果直接运行此文件，则执行演示
if (typeof window !== 'undefined' && window.document) {
  // 在浏览器环境中自动执行演示
  document.addEventListener('DOMContentLoaded', () => {
    console.log('引导模块示例已加载');
    
    // 创建演示按钮
    const demoButton = document.createElement('button');
    demoButton.textContent = '运行引导演示';
    demoButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;
    
    demoButton.addEventListener('click', demonstrateFullUsage);
    document.body.appendChild(demoButton);
  });
}