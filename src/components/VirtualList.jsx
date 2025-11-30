import React, { useState, useCallback, useRef, useEffect } from 'react';

// 虚拟滚动Hook（支持懒加载）
const useVirtualScroll = (items, itemHeight = 80, containerHeight = 400, onLoadMore, hasMore, loadingMore) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollTimeoutRef = useRef(null);
  const loadMoreTriggered = useRef(false);
  
  // 检查是否需要加载更多数据
  const checkLoadMore = useCallback((scrollTop, containerHeight, totalHeight) => {
    if (!hasMore || loadingMore || loadMoreTriggered.current) return;
    
    const scrollBottom = scrollTop + containerHeight;
    const triggerThreshold = totalHeight - containerHeight * 0.3; // 距离底部30%时触发
    
    if (scrollBottom >= triggerThreshold) {
      loadMoreTriggered.current = true;
      onLoadMore && onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);
  
  // 防抖滚动处理
  const handleScroll = useCallback((e) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollTop = e.target.scrollTop;
      setScrollTop(scrollTop);
      
      // 检查是否需要加载更多
      const container = e.target;
      const totalHeight = items.length * itemHeight;
      checkLoadMore(scrollTop, container.clientHeight, totalHeight);
    }, 16); // 约60fps的防抖
  }, [items.length, itemHeight, checkLoadMore]);
  
  // 重置加载触发状态
  useEffect(() => {
    if (!loadingMore) {
      loadMoreTriggered.current = false;
    }
  }, [loadingMore]);
  
  // 计算可见区域
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 4; // 增加缓冲区
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  
  // 可见项
  const visibleItems = items.slice(startIndex, endIndex);
  
  // 计算偏移量
  const offsetY = startIndex * itemHeight;
  
  return {
    containerRef,
    handleScroll,
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    startIndex,
    endIndex
  };
};

// 加载更多指示器组件
const LoadMoreIndicator = ({ loading, hasMore }) => {
  if (!hasMore) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#666',
        borderTop: '1px solid #f0f0f0'
      }}>
        没有更多数据了
      </div>
    );
  }
  
  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">加载中...</span>
        </div>
        <span className="ms-2 text-muted">加载更多...</span>
      </div>
    );
  }
  
  return null;
};

// 虚拟列表组件（支持懒加载）
const VirtualList = ({ 
  items, 
  itemHeight = 80, 
  containerHeight = 400, 
  renderItem,
  onLoadMore,
  hasMore = true,
  loadingMore = false
}) => {
  const {
    containerRef,
    handleScroll,
    visibleItems,
    offsetY,
    totalHeight,
    startIndex
  } = useVirtualScroll(items, itemHeight, containerHeight, onLoadMore, hasMore, loadingMore);
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        height: containerHeight, 
        overflow: 'auto',
        border: '1px solid #f0f0f0',
        borderRadius: '4px'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div 
              key={startIndex + index}
              style={{ 
                height: itemHeight,
                padding: '12px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff'
              }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
          
          {/* 加载更多指示器 */}
          {hasMore || loadingMore ? (
            <div style={{ 
              position: 'absolute', 
              top: totalHeight,
              left: 0, 
              right: 0,
              height: 'auto'
            }}>
              <LoadMoreIndicator loading={loadingMore} hasMore={hasMore} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VirtualList;