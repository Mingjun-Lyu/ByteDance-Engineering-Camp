import React from 'react';
import { Spin } from '@douyinfe/semi-ui';

// 加载指示器组件
const LoadingIndicator = ({ type = 'global', message = '加载中...' }) => {
  if (type === 'global') {
    return (
      <div className="loading-overlay">
        <Spin size="large" />
        <div className="loading-text">{message}</div>
      </div>
    );
  }
  
  return (
    <div className="local-loading">
      <Spin size="small" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingIndicator;