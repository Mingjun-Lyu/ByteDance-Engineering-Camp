import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI状态管理store
const useUiStore = create(
  persist(
    (set) => ({
  // 全局加载状态
  globalLoading: false,
  
  // 消息提示
  notifications: [],
  
  // 模态框状态
  modalVisible: false,
  modalProps: {},
  
  // 抽屉状态
  drawerVisible: false,
  drawerProps: {},
  
  // 表单状态
  forms: {},
  
  // 布局设置
  layout: {
    sidebarCollapsed: false,
    headerHeight: 64,
    sidebarWidth: 240,
    contentPadding: 16
  },
  
  // 主题设置
  theme: {
    mode: 'light', // 'light' or 'dark'
    primaryColor: '#1890ff'
  },
  
  // 设置全局加载状态
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  // 添加通知
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: 'info',
      duration: 3000,
      ...notification,
    }]
  })),
  
  // 移除通知
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(notification => notification.id !== id)
  })),
  
  // 清除所有通知
  clearNotifications: () => set({ notifications: [] }),
  
  // 显示成功通知
  showSuccess: (message, options = {}) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: 'success',
      message,
      duration: 3000,
      ...options,
    }]
  })),
  
  // 显示错误通知
  showError: (message, options = {}) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: 'error',
      message,
      duration: 5000,
      ...options,
    }]
  })),
  
  // 显示警告通知
  showWarning: (message, options = {}) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: 'warning',
      message,
      duration: 4000,
      ...options,
    }]
  })),
  
  // 显示信息通知
  showInfo: (message, options = {}) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: 'info',
      message,
      duration: 3000,
      ...options,
    }]
  })),
  
  // 设置模态框状态
  setModalVisible: (visible, props = {}) => set({
    modalVisible: visible,
    modalProps: props
  }),
  
  // 设置抽屉状态
  setDrawerVisible: (visible, props = {}) => set({
    drawerVisible: visible,
    drawerProps: props
  }),
  
  // 设置表单状态
  setFormState: (formId, state) => set((currentState) => ({
    forms: {
      ...currentState.forms,
      [formId]: state
    }
  })),
  
  // 更新表单字段
  updateFormField: (formId, fieldName, value) => set((currentState) => ({
    forms: {
      ...currentState.forms,
      [formId]: {
        ...currentState.forms[formId],
        [fieldName]: value
      }
    }
  })),
  
  // 重置表单
  resetForm: (formId) => set((currentState) => ({
    forms: {
      ...currentState.forms,
      [formId]: undefined
    }
  })),
  
  // 更新布局设置
  updateLayout: (layoutUpdates) => set((state) => ({
    layout: { ...state.layout, ...layoutUpdates }
  })),
  
  // 切换侧边栏折叠状态
  toggleSidebar: () => set((state) => ({
    layout: { ...state.layout, sidebarCollapsed: !state.layout.sidebarCollapsed }
  })),
  
  // 更新主题设置
  updateTheme: (themeUpdates) => set((state) => ({
    theme: { ...state.theme, ...themeUpdates }
  })),
  
  // 切换主题模式
  toggleThemeMode: () => set((state) => ({
    theme: { ...state.theme, mode: state.theme.mode === 'light' ? 'dark' : 'light' }
  }))
    }),
    {
      // 持久化配置
      name: 'ui-storage',
      partialize: (state) => ({
        // 只持久化用户偏好设置，不持久化临时状态
        layout: state.layout,
        theme: state.theme
      })
    }
  )
);

export default useUiStore;