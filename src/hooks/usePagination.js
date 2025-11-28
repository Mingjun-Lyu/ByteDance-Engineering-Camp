import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// 自定义Hook：分页逻辑
const usePagination = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialPagination = {
    currentPage: parseInt(searchParams.get('page')) || 1,
    pageSize: parseInt(searchParams.get('pageSize')) || 10,
    totalPages: 0,
    disablePagination: searchParams.get('disablePagination') === 'true'
  };
  
  const [pagination, setPagination] = useState(initialPagination);
  
  // 分页变化
  const handlePageChange = useCallback((currentPage, pageSize, filters) => {
    const newPagination = { currentPage, pageSize, disablePagination: false };
    setPagination(newPagination);
    
    // 更新URL参数
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', currentPage.toString());
    params.set('pageSize', pageSize.toString());
    params.delete('disablePagination');
    
    navigate({ search: params.toString() }, { replace: true });
  }, [navigate]);
  
  // 切换分页状态
  const togglePagination = useCallback((disablePagination, filters) => {
    const newPagination = {
      currentPage: 1,
      pageSize: pagination.pageSize,
      disablePagination
    };
    setPagination(newPagination);
    
    // 更新URL参数
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    if (disablePagination) {
      params.set('disablePagination', 'true');
      params.delete('page');
      params.delete('pageSize');
    } else {
      params.set('page', '1');
      params.set('pageSize', pagination.pageSize.toString());
      params.delete('disablePagination');
    }
    
    navigate({ search: params.toString() }, { replace: true });
  }, [navigate, pagination.pageSize]);
  
  // 计算总页数
  const calculateTotalPages = useCallback((total, pageSize) => {
    return Math.ceil(total / pageSize);
  }, []);
  
  return {
    pagination,
    setPagination,
    handlePageChange,
    togglePagination,
    calculateTotalPages
  };
};

export default usePagination;