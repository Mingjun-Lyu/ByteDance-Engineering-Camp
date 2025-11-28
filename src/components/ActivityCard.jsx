import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';

const ActivityCard = ({ activity }) => {
  if (!activity) {
    return null;
  }
  
  const getStatusConfig = (status) => {
    const statusMap = {
      ongoing: { text: '进行中', variant: 'success' },
      pending: { text: '待开始', variant: 'primary' },
      ended: { text: '已结束', variant: 'secondary' }
    };
    return statusMap[status] || { text: status, variant: 'secondary' };
  };

  const statusConfig = getStatusConfig(activity.status);

  return (
    <Card 
      className="h-100 shadow-sm"
      style={{ transition: 'all 0.3s', cursor: 'pointer' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
        <img 
          src={activity.banner || 'https://via.placeholder.com/400x300?text=暂无图片'} 
          alt={activity.title} 
          className="w-100 h-100 object-fit-cover"
          style={{ transition: 'transform 0.3s' }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
        <div className="position-absolute top-0 start-0 p-2">
          <Badge bg={statusConfig.variant}>{statusConfig.text}</Badge>
        </div>
        {activity.type && (
          <div className="position-absolute top-0 end-0 p-2">
            <Badge bg="warning">{activity.type}</Badge>
          </div>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Link 
          to={`/detail/${activity.id}`}
          className="text-decoration-none text-dark"
        >
          <Card.Title className="h6 mb-2 text-truncate">{activity.title}</Card.Title>
        </Link>
        <Card.Text 
          className="text-muted small flex-grow-1"
          style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {activity.description || '暂无描述'}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center text-muted small">
          <span>
            {activity.startTime ? new Date(activity.startTime).toLocaleDateString() : '时间待定'} - 
            {activity.endTime ? new Date(activity.endTime).toLocaleDateString() : '时间待定'}
          </span>
          <span>参与人数: {activity.participants || 0}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ActivityCard;