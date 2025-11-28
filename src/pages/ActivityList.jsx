import React, { useEffect } from 'react';
import { Card, Button } from '@douyinfe/semi-ui';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useActivityData, useFilterLogic, usePagination } from '../hooks';
import { FilterForm, ActivityListContent, LoadingIndicator } from '../components';
import './ActivityList.css';

// 主组件
const ActivityList = () => {
  // 使用自定义Hooks
  const { 
    activities, 
    allActivities,
    loading, 
    loadingAll,
    error, 
    total, 
    fetchActivities, 
    fetchAllActivities,
    prefetchNextPage 
  } = useActivityData();
  
  const { 
    filters,
    tempFilters,
    handleFilterSubmit,
    handleReset,
    updateTempFilter,
    debouncedSearch
  } = useFilterLogic();
  
  const { 
    pagination,
    setPagination,
    handlePageChange,
    togglePagination,
    calculateTotalPages
  } = usePagination();
  
  // 计算总页数
  useEffect(() => {
    if (!pagination.disablePagination) {
      const totalPages = calculateTotalPages(total, pagination.pageSize);
      setPagination(prev => ({ ...prev, totalPages }));
    }
  }, [total, pagination.pageSize, pagination.disablePagination, calculateTotalPages, setPagination]);
  
  // 数据获取
  useEffect(() => {
    if (pagination.disablePagination) {
      fetchAllActivities(filters);
    } else {
      fetchActivities(filters, pagination);
    }
  }, [filters, pagination.currentPage, pagination.pageSize, pagination.disablePagination]);
  
  // 预加载下一页
  useEffect(() => {
    if (!pagination.disablePagination && activities.length > 0) {
      prefetchNextPage(filters, pagination);
    }
  }, [filters, pagination.currentPage, pagination.pageSize, pagination.disablePagination, activities.length]);
  
  // 错误处理
  if (error) {
    return (
      <div className="error-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>加载失败</h3>
            <p>{error}</p>
            <Button type="primary" theme="solid" onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="activity-list-container">
      {/* <h1>活动列表</h1> */}
      
      {/* 筛选表单 */}
      <FilterForm
          tempFilters={tempFilters}
          updateTempFilter={updateTempFilter}
          handleFilterSubmit={handleFilterSubmit}
          handleReset={handleReset}
          pagination={pagination}
          togglePagination={togglePagination}
          filters={filters}
        />
      
      {/* 加载状态 */}
      {(loading || (pagination.disablePagination && loadingAll)) && (
        <LoadingIndicator type="global" message="加载活动数据中..." />
      )}
      
      {/* 活动列表内容 */}
      <ActivityListContent
        activities={activities}
        allActivities={allActivities}
        loading={loading}
        loadingAll={loadingAll}
        pagination={pagination}
        handlePageChange={handlePageChange}
        filters={filters}
        total={total}
      />
    </div>
  );
};

export default ActivityList;