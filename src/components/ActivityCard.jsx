import React from 'react';
import { Card } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import './ActivityCard.css';

const ActivityCard = ({ activity }) => {
  // 状态样式配置
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ongoing':
        return { text: '进行中', className: 'status-ongoing' };
      case 'upcoming':
      case 'pending':
        return { text: '即将开始', className: 'status-upcoming' };
      case 'ended':
        return { text: '已结束', className: 'status-ended' };
      default:
        return { text: '未知', className: 'status-unknown' };
    }
  };

  const statusConfig = getStatusConfig(activity.status);

  return (
    <Link to={`/detail/${activity.id}`} className="activity-card-link">
      <Card className="activity-card">
        <div className="activity-card-image-container">
          <img 
            src={activity.imageUrl || activity.coverImage || 'https://via.placeholder.com/400x300?text=Activity'} 
            alt={activity.title} 
            className="activity-card-image"
          />
          <div className={`activity-card-status ${statusConfig.className}`}>
            {statusConfig.text}
          </div>
        </div>
        <div className="activity-card-content">
          <h4 className="activity-card-title">{activity.title}</h4>
          <p className="activity-card-date">{activity.date || activity.timeRange || '时间待定'}</p>
          {activity.type && (
            <div className="activity-card-type">{activity.type}</div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ActivityCard;