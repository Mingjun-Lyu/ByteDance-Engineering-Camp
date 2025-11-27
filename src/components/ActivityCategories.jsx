import React from 'react';
import { Row, Col, Card } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import './ActivityCategories.css';

const ActivityCategories = () => {
  // 使用静态分类数据
  const categories = [
    {
      id: 'promotion',
      name: '促销活动',
      icon: '🛒',
      count: 28
    },
    {
      id: 'event',
      name: '线下活动',
      icon: '🏢',
      count: 15
    },
    {
      id: 'festival',
      name: '节日活动',
      icon: '🎉',
      count: 12
    },
    {
      id: 'exclusive',
      name: '专属活动',
      icon: '💎',
      count: 8
    }
  ];

  return (
    <div className="activity-categories">
      <h3 className="categories-title">活动分类</h3>
      <Row gutter={[16, 16]}>
        {categories.map(category => (
          <Col xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Link to={`/list?category=${category.id}`} className="category-link">
              <Card className="category-card">
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
                <div className="category-count">{category.count}个活动</div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ActivityCategories;