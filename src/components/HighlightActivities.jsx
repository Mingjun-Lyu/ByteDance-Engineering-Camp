import React, { useState } from 'react';
import { Carousel, Row, Col, Button, Card } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import './HighlightActivities.css';

const HighlightActivities = () => {
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' 或 'carousel'
  
  // 使用静态活动数据
  const activities = [
    {
      id: 1,
      title: '春季新品促销活动',
      imageUrl: 'https://via.placeholder.com/400x300?text=Activity+1',
      date: '2024-03-01 至 2024-03-31',
      status: 'ongoing',
      type: 'promotion'
    },
    {
      id: 2,
      title: '会员专享优惠日',
      imageUrl: 'https://via.placeholder.com/400x300?text=Activity+2',
      date: '2024-03-15',
      status: 'upcoming',
      type: 'exclusive'
    },
    {
      id: 3,
      title: '线下体验活动',
      imageUrl: 'https://via.placeholder.com/400x300?text=Activity+3',
      date: '2024-04-01 至 2024-04-02',
      status: 'upcoming',
      type: 'event'
    },
    {
      id: 4,
      title: '元宵节特别活动',
      imageUrl: 'https://via.placeholder.com/400x300?text=Activity+4',
      date: '2024-02-24',
      status: 'ended',
      type: 'festival'
    }
  ];

  return (
    <div className="highlight-activities">
      <div className="highlight-header">
        <h3 className="highlight-title">重点活动</h3>
        <div className="highlight-controls">
          <Button
            type={displayMode === 'grid' ? 'primary' : 'default'}
            size="small"
            onClick={() => setDisplayMode('grid')}
          >
            宫格
          </Button>
          <Button
            type={displayMode === 'carousel' ? 'primary' : 'default'}
            size="small"
            onClick={() => setDisplayMode('carousel')}
          >
            轮播
          </Button>
        </div>
      </div>

      {displayMode === 'carousel' ? (
        <div className="highlight-carousel">
          <Carousel
            autoplay
            autoplayInterval={5000}
            dots
            arrows
            pauseOnHover
          >
            {activities.map(activity => (
              <div key={activity.id} className="carousel-item">
                <div 
                  className="carousel-image" 
                  style={{ backgroundImage: `url(${activity.imageUrl})` }}
                >
                  <div className="carousel-content">
                    <h4 className="carousel-title">{activity.title}</h4>
                    <p className="carousel-date">{activity.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {activities.map(activity => (
            <Col xs={24} sm={12} md={8} lg={6} key={activity.id}>
              <ActivityCard activity={activity} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

// 活动卡片子组件
const ActivityCard = ({ activity }) => {
  // 状态样式配置
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ongoing':
        return { text: '进行中', className: 'status-ongoing' };
      case 'upcoming':
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
            src={activity.imageUrl} 
            alt={activity.title} 
            className="activity-card-image"
          />
          <div className={`activity-card-status ${statusConfig.className}`}>
            {statusConfig.text}
          </div>
        </div>
        <div className="activity-card-content">
          <h4 className="activity-card-title">{activity.title}</h4>
          <p className="activity-card-date">{activity.date}</p>
        </div>
      </Card>
    </Link>
  );
};

export default HighlightActivities;