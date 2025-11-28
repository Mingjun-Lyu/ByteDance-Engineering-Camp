import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityCard from './ActivityCard';
import { Card, Row, Col, Button, Carousel, Typography } from '@douyinfe/semi-ui';

const HighlightActivities = ({ activities }) => {
  const [layout, setLayout] = useState('grid'); // 默认使用宫格布局
  const { Title } = Typography;
  
  // 调试信息
  console.log('HighlightActivities activities:', activities);
  console.log('HighlightActivities activities length:', activities?.length);
  
  if (!activities || activities.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>没有活动数据</div>;
  }
  
  return (
    <Card style={{ margin: '20px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
      }}>
        <Title heading={4} style={{ margin: 0 }}>
          重点活动
        </Title>
        <div>
          <Button 
            type={layout === 'grid' ? 'primary' : 'secondary'}
            style={{ marginRight: '8px' }}
            onClick={() => setLayout('grid')}
          >
            宫格布局
          </Button>
          <Button 
            type={layout === 'carousel' ? 'primary' : 'secondary'}
            onClick={() => setLayout('carousel')}
          >
            轮播布局
          </Button>
        </div>
      </div>
      
      {layout === 'grid' ? (
        <Row gutter={16} style={{ display: 'flex', flexWrap: 'wrap' }}>
          {activities.map(activity => (
            <Col xs={24} sm={12} md={8} lg={6} key={activity.id} style={{ display: 'flex' }}>
              <div style={{ width: '100%', marginBottom: '10px' }}>
                <ActivityCard activity={activity} />
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        // 使用Semi UI的Carousel组件实现轮播
        <Carousel 
          autoplay 
          autoplayInterval={3000} 
          dotPosition="bottom"
          style={{
            margin: '0 auto',
            width: '100%',
            height: '400px',
          }}
        >
          {activities.map(activity => (
            <div key={activity.id} style={{ 
              padding: '0', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              <Link to={`/detail/${activity.id}`} style={{ width: '100%', height: '100%' }}>
                <img 
                  src={activity.banner} 
                  alt={activity.title} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s'
                  }}
                />
                {/* 在图片上添加标题 */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  padding: '20px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {activity.title}
                </div>
              </Link>
            </div>
          ))}
        </Carousel>
      )}
    </Card>
  );
};

export default HighlightActivities;