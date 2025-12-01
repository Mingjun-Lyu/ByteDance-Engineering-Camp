// 活动管理平台引导配置
export const activityPlatformGuideConfig = {
  id: 'activity-platform-guide',
  name: '活动管理平台功能引导',
  description: '帮助新用户快速了解平台的主要功能和操作流程',
  version: '1.0.0',
  steps: [
    // 步骤1: 展示主页横幅
    {
      id: 'home-banner',
      title: '欢迎来到活动管理平台',
      content: '这是平台的主页横幅，展示了最新的活动信息和平台特色。',
      target: '.banner-section',
      position: 'bottom',
      action: 'highlight',
      route: '/'
    },
    
    // 步骤2: 展示活动分类
    {
      id: 'activity-categories',
      title: '活动分类',
      content: '这里展示了不同类型的活动分类，方便您快速找到感兴趣的活动。',
      target: '.categories-section',
      position: 'bottom',
      action: 'highlight',
      route: '/'
    },
    
    // 步骤3: 展示公告信息
    {
      id: 'notice-section',
      title: '公告信息',
      content: '这里显示平台的重要公告和通知信息，请及时关注。',
      target: '.notice-section',
      position: 'bottom',
      action: 'highlight',
      route: '/'
    },
    
    // 步骤4: 展示重点活动
    {
      id: 'highlight-activities',
      title: '重点活动',
      content: '这里展示的是平台的重点推荐活动，具有较高的参与价值。',
      target: '.highlight-activities-section',
      position: 'bottom',
      action: 'highlight',
      route: '/'
    },
    
    // 步骤5: 指导用户点击导航栏的活动列表
    {
      id: 'navigate-to-list',
      title: '查看活动列表',
      content: '点击导航栏中的"活动列表"按钮，可以查看所有活动的完整列表。',
      target: 'a[href*="/list"]',
      position: 'bottom',
      action: 'click',
      route: '/'
    }
  ],
  
  // 引导配置选项
  options: {
    autoStart: false,
    allowSkip: true,
    showProgress: true,
    highlightTarget: true,
    overlayOpacity: 0.3,
    tooltipPosition: 'auto',
    keyboardNavigation: true
  },
  
  // 引导完成后的回调
  onComplete: () => {
    console.log('活动管理平台引导已完成');
    // 可以在这里添加完成后的逻辑，比如显示完成提示等
  },
  
  // 引导跳过的回调
  onSkip: () => {
    console.log('活动管理平台引导已跳过');
    // 可以在这里添加跳过后的逻辑
  }
};