import React, { useState, useCallback, useRef } from 'react';

// 虚拟滚动Hook
const useVirtualScroll = (items, itemHeight = 80, containerHeight = 400) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // 防抖滚动处理
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
  }, []);
  
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

// 虚拟列表组件
const VirtualList = ({ items, itemHeight = 80, containerHeight = 400, renderItem }) => {
  const {
    containerRef,
    handleScroll,
    visibleItems,
    offsetY,
    totalHeight,
    startIndex
  } = useVirtualScroll(items, itemHeight, containerHeight);
  
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
        </div>
      </div>
    </div>
  );
};

export default VirtualList;