import { useQueries } from '@tanstack/react-query';
import { useActivityStore, useUiStore } from '../store';
import { activityApiService } from '../services/apiService';

// 获取首页数据的自定义Hook
export const useHomeData = () => {
  const {
    banners,
    categories,
    highlightActivities,
    homePageLoading,
    setBanners,
    setCategories,
    setHighlightActivities,
    setHomePageLoading
  } = useActivityStore();
  
  const { showError } = useUiStore();

  // 并行查询多个数据源
  const results = useQueries({
    queries: [
      // 获取轮播图
      {
        queryKey: ['banners'],
        queryFn: async () => {
          try {
            setHomePageLoading(true);
            const bannersData = await activityApiService.getBanners();
            setBanners(bannersData);
            return bannersData;
          } catch (error) {
            console.error('获取轮播图失败:', error);
            showError(`获取轮播图失败: ${error.message}`);
            throw error;
          }
        },
        staleTime: 10 * 60 * 1000, // 10分钟
        gcTime: 30 * 60 * 1000, // 30分钟
        refetchOnWindowFocus: true
      },
      
      // 获取活动分类
      {
        queryKey: ['categories'],
        queryFn: async () => {
          try {
            const categoriesData = await activityApiService.getActivityCategories();
            setCategories(categoriesData);
            return categoriesData;
          } catch (error) {
            console.error('获取活动分类失败:', error);
            showError(`获取活动分类失败: ${error.message}`);
            throw error;
          }
        },
        staleTime: 30 * 60 * 1000, // 30分钟
        gcTime: 60 * 60 * 1000, // 1小时
        refetchOnWindowFocus: false // 分类数据变化不频繁，不需要在窗口焦点时重新获取
      },
      
      // 获取重点活动
      {
        queryKey: ['highlightActivities'],
        queryFn: async () => {
          try {
            const activitiesData = await activityApiService.getHighlightActivities();
            setHighlightActivities(activitiesData);
            return activitiesData;
          } catch (error) {
            console.error('获取重点活动失败:', error);
            showError(`获取重点活动失败: ${error.message}`);
            throw error;
          } finally {
            setHomePageLoading(false);
          }
        },
        staleTime: 5 * 60 * 1000, // 5分钟
        gcTime: 15 * 60 * 1000, // 15分钟
        refetchOnWindowFocus: true
      }
    ]
  });

  // 解构查询结果
  const [bannersResult, categoriesResult, highlightActivitiesResult] = results;

  // 计算总体加载状态
  const isLoading = bannersResult.isLoading || categoriesResult.isLoading || highlightActivitiesResult.isLoading;
  const isError = bannersResult.isError || categoriesResult.isError || highlightActivitiesResult.isError;
  const error = bannersResult.error || categoriesResult.error || highlightActivitiesResult.error;

  // 刷新所有数据
  const refreshAll = async () => {
    setHomePageLoading(true);
    try {
      await Promise.all([
        bannersResult.refetch(),
        categoriesResult.refetch(),
        highlightActivitiesResult.refetch()
      ]);
    } catch (err) {
      console.error('刷新首页数据失败:', err);
      showError('刷新首页数据失败');
    } finally {
      setHomePageLoading(false);
    }
  };

  return {
    // 数据
    banners: banners || bannersResult.data || [],
    categories: categories || categoriesResult.data || [],
    highlightActivities: highlightActivities || highlightActivitiesResult.data || [],
    
    // 状态
    isLoading,
    isError,
    error,
    homePageLoading,
    
    // 单个查询的状态
    bannersLoading: bannersResult.isLoading,
    bannersError: bannersResult.error,
    categoriesLoading: categoriesResult.isLoading,
    categoriesError: categoriesResult.error,
    highlightActivitiesLoading: highlightActivitiesResult.isLoading,
    highlightActivitiesError: highlightActivitiesResult.error,
    
    // 刷新方法
    refreshAll,
    refreshBanners: bannersResult.refetch,
    refreshCategories: categoriesResult.refetch,
    refreshHighlightActivities: highlightActivitiesResult.refetch,
    
    // 辅助方法：获取分类名称
    getCategoryName: (categoryId) => {
      const category = (categories || []).find(c => c.id === Number(categoryId));
      return category ? category.name : '未知分类';
    },
    
    // 辅助方法：检查是否有活动数据
    hasHomeData: () => {
      return (
        (banners || []).length > 0 &&
        (categories || []).length > 0 &&
        (highlightActivities || []).length > 0
      );
    }
  };
};

export default useHomeData;