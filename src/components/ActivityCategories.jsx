import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Row, Col } from '@douyinfe/semi-ui';

const ActivityCategories = ({ categories }) => {
  const { Title } = Typography;

  // 处理分类点击事件
  const handleCategoryClick = (category) => {
    // 这里可以添加分类点击后的逻辑
    console.log('分类点击:', category);
  };

  return (
    <Card style={{ margin: '20px 0' }}>
      <Title heading={4} style={{ marginBottom: '16px', marginTop: 0 }}>
        活动分类
      </Title>
      <Row gutter={16}>
        {categories.map((category) => (
          <Col xs={24} sm={12} md={8} key={category.id}>
            <Link
              to={`/activities/category/${category.id}`}
              onClick={() => handleCategoryClick(category)}
              style={{ textDecoration: 'none' }}
            >
              <Card
                hoverable
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div
                  style={{
                    backgroundColor: category.color || '#1890ff',
                    width: '64px',
                    height: '64px',
                    marginBottom: '16px',
                    fontSize: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  {category.icon || '分'}
                </div>
                <Title heading={5} style={{ margin: 0 }}>
                  {category.name}
                </Title>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default ActivityCategories;