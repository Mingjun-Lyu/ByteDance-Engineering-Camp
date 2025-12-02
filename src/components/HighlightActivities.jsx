import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityCard from './ActivityCard';
import { Card, Row, Col, Button, Carousel, ButtonGroup } from 'react-bootstrap';

const HighlightActivities = ({ activities }) => {
  const [layout, setLayout] = useState('grid'); // 默认使用宫格布局
  
  // 调试信息
  console.log('HighlightActivities activities:', activities);
  console.log('HighlightActivities activities length:', activities?.length);
  
  if (!activities || activities.length === 0) {
    return <div className="text-center p-5 text-muted">没有活动数据</div>;
  }
  
  return (
    <Card className="mb-4 highlight-activities">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <h4 className="mb-0">重点活动</h4>
        <ButtonGroup size="sm">
          <Button 
            variant={layout === 'grid' ? 'primary' : 'outline-primary'}
            onClick={() => setLayout('grid')}
            className="grid-layout-btn"
          >
            宫格布局
          </Button>
          <Button 
            variant={layout === 'carousel' ? 'primary' : 'outline-primary'}
            onClick={() => setLayout('carousel')}
            className="carousel-layout-btn"
          >
            轮播布局
          </Button>
        </ButtonGroup>
      </Card.Header>
      <Card.Body>
        {layout === 'grid' ? (
          <Row className="g-3">
            {activities.map((activity, index) => (
              <Col xs={12} sm={6} md={4} lg={3} key={activity.id}>
                <ActivityCard 
                  activity={activity} 
                  className={index === 0 ? 'first-activity-card first-highlight-activity' : ''}
                  data-activity-id={activity.id}
                />
              </Col>
            ))}
          </Row>
        ) : (
          // 使用React Bootstrap的Carousel组件实现轮播
          <Carousel interval={3000} indicators={true} controls={true} className="highlight-carousel">
            {activities.map((activity, index) => (
              <Carousel.Item key={activity.id} className={index === 0 ? 'first-carousel-item' : ''}>
                <Link to={`/detail/${activity.id}`} style={{ textDecoration: 'none' }}>
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{ 
                      height: '400px',
                      backgroundImage: `url('${activity.banner}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* 在图片上添加标题 */}
                    <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white p-4 text-center">
                      <h5 className="mb-0 fw-bold">{activity.title}</h5>
                    </div>
                  </div>
                </Link>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Card.Body>
    </Card>
  );
};

export default HighlightActivities;