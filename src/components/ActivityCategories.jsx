import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';

const ActivityCategories = ({ categories }) => {
  // 根据分类值获取对应的图标和颜色
  const getCategoryIcon = (value) => {
    const iconMap = {
      promotion: '💼', // 促销活动图标
      offline: '🏢',   // 线下活动图标
      festival: '🎉',  // 节日活动图标
      exclusive: '✨'  // 专属活动图标
    };
    return iconMap[value] || '📋';
  };

  const getCategoryColor = (value) => {
    const colorMap = {
      promotion: 'danger', // 红色 - 促销
      offline: 'primary',  // 蓝色 - 线下
      festival: 'success', // 绿色 - 节日
      exclusive: 'info'     // 紫色 - 专属
    };
    return colorMap[value] || 'primary';
  };

  // 处理分类点击事件
  const handleCategoryClick = (category) => {
    console.log('分类点击:', category);
  };

  return (
    <Card className="mb-4 activity-categories">
      <Card.Header className="bg-light">
        <h4 className="mb-0">活动分类</h4>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {categories.map((category, index) => (
            <Col xs={12} sm={6} md={3} key={category.value}>
              <Link
                to={`/list?category=${category.value}`}
                onClick={() => handleCategoryClick(category)}
                style={{ textDecoration: 'none' }}
              >
                <Card 
                  className={`text-center h-100 border-${getCategoryColor(category.value)} shadow-sm category-card ${index === 0 ? 'first-category-card' : ''}`}
                  style={{ transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <div className="mb-3" style={{ fontSize: '2.5rem' }}>
                      {getCategoryIcon(category.value)}
                    </div>
                    <h5 className={`text-${getCategoryColor(category.value)} mb-2`}>
                      {category.label}活动
                    </h5>
                    <small className="text-muted">{category.count}个活动</small>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ActivityCategories;