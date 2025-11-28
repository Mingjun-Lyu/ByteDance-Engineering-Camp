import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 活动状态管理store
const useActivityStore = create(
  persist(
    (set, get) => ({
      // 活动数据缓存
      activitiesCache: {},
      
      // 当前活动详情
      currentActivity: null,
      
      // 活动收藏状态
      favorites: [],
      
      // 活动参与状态
      participation: {},
      
      // 活动浏览历史
      history: [],
      
      // 筛选条件缓存
      filterCache: {
        category: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      
      // 缓存活动数据
      cacheActivities: (key, activities) => set((state) => ({
        activitiesCache: {
          ...state.activitiesCache,
          [key]: {
            data: activities,
            timestamp: Date.now()
          }
        }
      })),
      
      // 获取缓存的活动数据
      getCachedActivities: (key) => {
        const cache = get().activitiesCache[key];
        if (cache && Date.now() - cache.timestamp < 5 * 60 * 1000) { // 5分钟缓存
          return cache.data;
        }
        return null;
      },
      
      // 清除缓存
      clearCache: (key) => set((state) => {
        if (key) {
          const newCache = { ...state.activitiesCache };
          delete newCache[key];
          return { activitiesCache: newCache };
        }
        return { activitiesCache: {} };
      }),
      
      // 设置当前活动详情
      setCurrentActivity: (activity) => set({ currentActivity: activity }),
      
      // 清除当前活动详情
      clearCurrentActivity: () => set({ currentActivity: null }),
      
      // 切换收藏状态
      toggleFavorite: (activityId) => set((state) => {
        const isFavorite = state.favorites.includes(activityId);
        const newFavorites = isFavorite 
          ? state.favorites.filter(id => id !== activityId)
          : [...state.favorites, activityId];
        
        return { favorites: newFavorites };
      }),
      
      // 检查是否收藏
      isFavorite: (activityId) => get().favorites.includes(activityId),
      
      // 设置参与状态
      setParticipation: (activityId, status) => set((state) => ({
        participation: {
          ...state.participation,
          [activityId]: status
        }
      })),
      
      // 获取参与状态
      getParticipation: (activityId) => get().participation[activityId],
      
      // 添加浏览历史
      addToHistory: (activity) => set((state) => {
        const newHistory = state.history.filter(item => item.id !== activity.id);
        newHistory.unshift(activity);
        
        // 限制历史记录数量
        if (newHistory.length > 50) {
          newHistory.pop();
        }
        
        return { history: newHistory };
      }),
      
      // 清除浏览历史
      clearHistory: () => set({ history: [] }),
      
      // 设置筛选条件缓存
      setFilterCache: (filters) => set((state) => ({
        filterCache: { ...state.filterCache, ...filters }
      })),
      
      // 获取筛选条件缓存
      getFilterCache: () => get().filterCache,
      
      // 清除筛选条件缓存
      clearFilterCache: () => set({
        filterCache: {
          category: '',
          search: '',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      })
    }),
    {
      // 持久化配置
      name: 'activity-storage',
      partialize: (state) => ({
        // 只持久化用户偏好数据，不持久化缓存数据
        favorites: state.favorites,
        participation: state.participation,
        history: state.history,
        filterCache: state.filterCache
      })
    }
  )
);

export default useActivityStore;