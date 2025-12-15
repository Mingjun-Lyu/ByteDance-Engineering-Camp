import { useState, useCallback, useRef, useEffect } from 'react';

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

export default useVirtualScroll;