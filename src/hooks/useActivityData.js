import { useState, useCallback, useRef } from 'react';
import activityApiService from '../services/apiService';

// 自定义Hook：数据管理（支持懒加载）
const useActivityData = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [allActivities, setAllActivities] = useState([]);
  const [loadingAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // 请求缓存
  const requestCache = useRef(new Map());
  // 懒加载状态
  const lazyLoadState = useRef({
    currentPage: 1,
    pageSize: 20,
    isLoading: false,
    hasMore: true
  });

  const fetchActivities = useCallback(async (filters, pagination) => {
    const cacheKey = JSON.stringify({ filters, pagination });
    
    // 检查缓存
    if (requestCache.current.has(cacheKey)) {
      const cachedData = requestCache.current.get(cacheKey);
      setActivities(cachedData.list);
      setTotal(cachedData.pagination.total);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filters
      };
      
      // 过滤空值参数
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      

      
      const res = await activityApiService.getActivityList(params);
      
      // 缓存结果
      requestCache.current.set(cacheKey, res);
      
      setActivities(res.list);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(err.message);
      console.error('获取活动列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 懒加载获取数据（按需加载）
  const fetchLazyActivities = useCallback(async (filters, options = {}) => {
    const { reset = false, append = true } = options;
    
    if (lazyLoadState.current.isLoading) return;
    
    try {
      lazyLoadState.current.isLoading = true;
      setLoadingMore(true);
      
      if (reset) {
        // 重置状态
        lazyLoadState.current.currentPage = 1;
        lazyLoadState.current.hasMore = true;
        setHasMore(true);
        setAllActivities([]);
        setTotal(0);
      }
      
      if (!lazyLoadState.current.hasMore) return;
      
      const params = {
        page: lazyLoadState.current.currentPage,
        pageSize: lazyLoadState.current.pageSize,
        ...filters
      };
      
      // 过滤空值参数
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const res = await activityApiService.getActivityList(params);
      
      // 更新状态
      lazyLoadState.current.currentPage += 1;
      lazyLoadState.current.hasMore = res.list.length === lazyLoadState.current.pageSize;
      setHasMore(lazyLoadState.current.hasMore);
      
      // 更新数据
      if (append) {
        setAllActivities(prev => [...prev, ...res.list]);
      } else {
        setAllActivities(res.list);
      }
      
      setTotal(res.pagination.total);
      
    } catch (err) {
      setError(err.message);
      console.error('懒加载活动数据失败:', err);
    } finally {
      lazyLoadState.current.isLoading = false;
      setLoadingMore(false);
    }
  }, []);

  // 预加载下一页数据
  const prefetchNextPage = useCallback((filters, pagination) => {
    const nextPage = pagination.currentPage + 1;
    const cacheKey = JSON.stringify({ filters, pagination: { ...pagination, currentPage: nextPage } });
    
    if (!requestCache.current.has(cacheKey)) {
      const params = {
        page: nextPage,
        pageSize: pagination.pageSize,
        ...filters
      };
      
      activityApiService.getActivityList(params).then(res => {
        requestCache.current.set(cacheKey, res);
      });
    }
  }, []);

  // 重置懒加载状态
  const resetLazyLoad = useCallback(() => {
    lazyLoadState.current = {
      currentPage: 1,
      pageSize: 20,
      isLoading: false,
      hasMore: true
    };
    setHasMore(true);
    setAllActivities([]);
    setTotal(0);
  }, []);

  return { 
    activities, 
    allActivities,
    loading, 
    loadingAll,
    loadingMore,
    error, 
    total, 
    hasMore,
    fetchActivities, 
    fetchLazyActivities,
    prefetchNextPage,
    resetLazyLoad
  };
};

export default useActivityData;