import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// 自定义Hook：筛选逻辑
const useFilterLogic = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 解析URL参数中的时间格式
  const parseDateParam = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString();
    } catch {
      return '';
    }
  };
  
  const initialFilters = {
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    keyword: searchParams.get('keyword') || '',
    startTime: parseDateParam(searchParams.get('startTime')),
    endTime: parseDateParam(searchParams.get('endTime'))
  };
  
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  
  // 防抖搜索
  const debouncedSearch = useCallback((keyword, callback) => {
    let timeoutId;
    
    return (newKeyword) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(newKeyword);
      }, 300);
    };
  }, []);
  
  // 筛选提交
  const handleFilterSubmit = useCallback(() => {
    // 清理空值并转换日期参数名称
    const cleanedFilters = Object.fromEntries(
      Object.entries(tempFilters).filter(([, value]) => 
        value !== '' && value !== null && value !== undefined
      ).map(([key, value]) => {
        // 转换日期参数名称以匹配API期望的参数
        if (key === 'startTime') return ['startDate', value];
        if (key === 'endTime') return ['endDate', value];
        return [key, value];
      })
    );
    

    
    setFilters(cleanedFilters);
    
    // 更新URL参数（保持原始参数名称）
    const params = new URLSearchParams();
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    params.set('page', '1'); // 重置到第一页
    
    navigate({ search: params.toString() }, { replace: true });
  }, [tempFilters, navigate]);
  
  // 筛选重置
  const handleReset = useCallback(() => {
    const emptyFilters = {
      category: '',
      status: '',
      keyword: '',
      startTime: '',
      endTime: ''
    };
    
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    
    // 清空URL参数
    navigate({ search: '?page=1' }, { replace: true });
  }, [navigate]);
  
  // 更新临时筛选状态
  const updateTempFilter = useCallback((key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  return {
    filters,
    tempFilters,
    handleFilterSubmit,
    handleReset,
    updateTempFilter,
    debouncedSearch
  };
};

export default useFilterLogic;