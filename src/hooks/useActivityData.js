import { useState, useCallback, useRef } from 'react';
import activityApiService from '../services/apiService';

// 自定义Hook：数据管理
const useActivityData = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [allActivities, setAllActivities] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  
  // 请求缓存
  const requestCache = useRef(new Map());
  
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
  
  // 获取所有数据（取消分页时使用）
  const fetchAllActivities = useCallback(async (filters) => {
    const cacheKey = JSON.stringify({ filters, all: true });
    
    // 检查缓存
    if (requestCache.current.has(cacheKey)) {
      const cachedData = requestCache.current.get(cacheKey);
      setAllActivities(cachedData.list);
      setTotal(cachedData.pagination.total);
      return;
    }
    
    try {
      setLoadingAll(true);
      setError(null);
      
      const params = {
        page: 1,
        pageSize: 1000, // 获取大量数据
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
      
      setAllActivities(res.list);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(err.message);
      console.error('获取所有活动数据失败:', err);
    } finally {
      setLoadingAll(false);
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
  
  return { 
    activities, 
    allActivities,
    loading, 
    loadingAll,
    error, 
    total, 
    fetchActivities, 
    fetchAllActivities,
    prefetchNextPage 
  };
};

export default useActivityData;