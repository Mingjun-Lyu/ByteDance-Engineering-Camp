import React from 'react';
import './ActivityHome.css';

const ActivityHome = () => {
  // 使用静态文本代替真实数据
  return (
    <div className="activity-home">
      {/* Banner轮播 */}
      <div className="banner-section">
        <h2>轮播图区域</h2>
        <div className="banner-placeholder">
          这里是Banner轮播组件
        </div>
      </div>
      
      {/* 活动分类 */}
      <div className="categories-section">
        <h2>活动分类</h2>
        <div className="categories-placeholder">
          这里是活动分类组件，包含促销活动、线下活动、节日活动、专属活动等分类
        </div>
      </div>
      
      {/* 公告信息 */}
      <div className="notice-section">
        <h2>公告信息</h2>
        <div className="notice-placeholder">
          这里是公告列表，展示系统最新公告
        </div>
      </div>
      
      {/* 重点活动 */}
      <div className="highlight-section">
        <h2>重点活动</h2>
        <div className="highlight-placeholder">
          这里是重点活动展示组件，支持宫格布局和轮播布局切换
        </div>
      </div>
    </div>
  );
};

export default ActivityHome;