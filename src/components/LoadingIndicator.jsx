import React from 'react';
import { Spinner } from 'react-bootstrap';

// 加载指示器组件
const LoadingIndicator = ({ type = 'global', message = '加载中...' }) => {
  if (type === 'global') {
    return (
      <div className="loading-overlay d-flex flex-column align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <div className="loading-text mt-2">{message}</div>
      </div>
    );
  }
  
  return (
    <div className="local-loading d-flex align-items-center gap-2">
      <Spinner animation="border" size="sm" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingIndicator;