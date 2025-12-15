import React from 'react';
import useVirtualScroll from '../hooks/useVirtualScroll';

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