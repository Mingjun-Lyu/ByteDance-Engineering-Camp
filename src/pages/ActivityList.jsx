import React, { useEffect } from 'react';
import { Card, Button, Container } from 'react-bootstrap';
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
    loadingMore,
    error, 
    total, 
    hasMore,
    fetchActivities, 
    fetchLazyActivities,
    prefetchNextPage
  } = useActivityData();
  
  const { 
    filters,
    tempFilters,
    handleFilterSubmit,
    handleReset,
    updateTempFilter
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
      // 使用懒加载模式
      fetchLazyActivities(filters, { reset: true });
    } else {
      fetchActivities(filters, pagination);
    }
  }, [filters, pagination, fetchLazyActivities, fetchActivities]);
  
  // 预加载下一页
  useEffect(() => {
    if (!pagination.disablePagination && activities.length > 0) {
      prefetchNextPage(filters, pagination);
    }
  }, [filters, pagination, activities.length, prefetchNextPage]);
  
  // 错误处理
  if (error) {
    return (
      <Container className="error-container">
        <Card className="text-center">
          <Card.Body className="py-5">
            <h3>加载失败</h3>
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container fluid className="activity-list-container py-4">
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
        loadingMore={loadingMore}
        pagination={pagination}
        handlePageChange={handlePageChange}
        filters={filters}
        total={total}
        hasMore={hasMore}
        fetchLazyActivities={fetchLazyActivities}
        error={error}
      />
    </Container>
  );
};

export default ActivityList;