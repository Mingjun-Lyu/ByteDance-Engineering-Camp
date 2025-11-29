/**
 * 基础引导配置示例
 * 展示如何配置一个简单的新手引导
 */

export const basicGuideConfig = {
  id: 'welcome-guide',
  name: '欢迎引导',
  description: '新用户欢迎引导，介绍主要功能',
  steps: [
    {
      id: 'welcome-step',
      title: '欢迎使用我们的平台',
      content: '这是一个简单的欢迎引导，将向您介绍平台的主要功能。',
      type: 'info',
      position: 'center'
    },
    {
      id: 'banner-step',
      title: '主横幅区域',
      content: '这里展示重要的活动信息和公告。',
      type: 'info',
      target: {
        type: 'component',
        component: 'Banner'
      },
      position: 'bottom'
    },
    {
      id: 'categories-step',
      title: '活动分类',
      content: '通过分类快速找到您感兴趣的活动类型。',
      type: 'info',
      target: {
        type: 'component',
        component: 'ActivityCategories'
      },
      position: 'right'
    },
    {
      id: 'notice-step',
      title: '通知区域',
      content: '重要通知和系统消息会在这里显示。',
      type: 'info',
      target: {
        type: 'component',
        component: 'Notice'
      },
      position: 'left'
    }
  ],
  conditions: [
    {
      type: 'function',
      validator: () => {
        // 只在第一次访问时显示
        return !localStorage.getItem('welcome-guide-completed');
      }
    }
  ]
};

/**
 * 高级引导配置示例
 * 展示包含条件验证和交互的引导
 */
export const advancedGuideConfig = {
  id: 'activity-discovery',
  name: '活动发现引导',
  description: '帮助用户发现和参与活动',
  steps: [
    {
      id: 'discovery-intro',
      title: '发现精彩活动',
      content: '让我们一起来探索平台上的各种活动吧！',
      type: 'info',
      conditions: [
        {
          type: 'data',
          expression: 'activities.length > 0',
          context: 'global'
        }
      ]
    },
    {
      id: 'filter-step',
      title: '筛选活动',
      content: '使用筛选功能快速找到符合您需求的活动。',
      type: 'interactive',
      target: {
        type: 'component',
        component: 'FilterForm'
      },
      actions: [
        {
          type: 'click',
          target: '.filter-button',
          description: '点击筛选按钮'
        }
      ]
    },
    {
      id: 'highlight-step',
      title: '热门活动',
      content: '这里展示当前最受欢迎的活动。',
      type: 'info',
      target: {
        type: 'component',
        component: 'HighlightActivities'
      }
    }
  ],
  options: {
    allowSkip: true,
    showProgress: true,
    autoAdvance: false
  }
};

/**
 * 空状态引导配置
 * 当页面没有数据时显示的引导
 */
export const emptyStateGuideConfig = {
  id: 'empty-state-guide',
  name: '空状态引导',
  description: '当页面没有数据时提供指导',
  steps: [
    {
      id: 'empty-intro',
      title: '还没有活动',
      content: '看起来当前还没有可用的活动，让我们来创建一个吧！',
      type: 'info',
      conditions: [
        {
          type: 'data',
          expression: 'activities.length === 0',
          context: 'global'
        }
      ]
    },
    {
      id: 'create-action',
      title: '创建第一个活动',
      content: '点击这里开始创建您的第一个活动。',
      type: 'action',
      target: {
        type: 'css',
        selector: '.create-activity-button'
      },
      actions: [
        {
          type: 'click',
          description: '创建活动'
        }
      ]
    }
  ]
};