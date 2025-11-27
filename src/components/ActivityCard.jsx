import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag, Typography } from '@douyinfe/semi-ui';

const ActivityCard = ({ activity }) => {
  if (!activity) {
    return null;
  }
  
  const getStatusConfig = (status) => {
    const statusMap = {
      ongoing: { text: '进行中', color: 'green' },
      pending: { text: '待开始', color: 'blue' },
      ended: { text: '已结束', color: 'grey' }
    };
    return statusMap[status] || { text: status, color: 'default' };
  };

  const { Text } = Typography;
  const statusConfig = getStatusConfig(activity.status);

  return (
    <Card
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s'
      }}
    >
      <div style={{
        position: 'relative',
        height: '180px',
        overflow: 'hidden'
      }}>
        <img 
          src={activity.banner || 'https://via.placeholder.com/400x300?text=暂无图片'} 
          alt={activity.title} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
        <Tag 
          color={statusConfig.color} 
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 1
          }}
        >
          {statusConfig.text}
        </Tag>
        {activity.type && (
          <Tag 
            color="orange" 
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1
            }}
          >
            {activity.type}
          </Tag>
        )}
      </div>
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Link 
          to={`/detail/${activity.id}`}
          style={{
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {activity.title}
          </h3>
        </Link>
        <Text 
          ellipsis={{ rows: 2 }}
          style={{
            marginBottom: '12px',
            color: '#666',
            flex: 1
          }}
        >
          {activity.description || '暂无描述'}
        </Text>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          color: '#888'
        }}>
          <span>
            {activity.startTime ? new Date(activity.startTime).toLocaleDateString() : '时间待定'} - 
            {activity.endTime ? new Date(activity.endTime).toLocaleDateString() : '时间待定'}
          </span>
          <span>参与人数: {activity.participants || 0}</span>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;