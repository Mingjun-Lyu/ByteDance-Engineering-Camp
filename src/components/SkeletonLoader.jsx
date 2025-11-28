import React from 'react';
import { Card } from '@douyinfe/semi-ui';

// 骨架屏组件
const SkeletonLoader = ({ count = 10 }) => {
  return (
    <Card className="skeleton-card">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-meta"></div>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default SkeletonLoader;