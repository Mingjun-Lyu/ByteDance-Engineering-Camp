import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Row, Col } from '@douyinfe/semi-ui';

const ActivityCategories = ({ categories }) => {
  const { Title } = Typography;

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
      promotion: '#ff4d4f', // 红色 - 促销
      offline: '#1890ff',   // 蓝色 - 线下
      festival: '#52c41a',  // 绿色 - 节日
      exclusive: '#722ed1'  // 紫色 - 专属
    };
    return colorMap[value] || '#1890ff';
  };

  // 处理分类点击事件
  const handleCategoryClick = (category) => {
    console.log('分类点击:', category);
  };

  return (
    <Card style={{ margin: '20px 0' }}>
      <Title heading={4} style={{ marginBottom: '16px', marginTop: 0 }}>
        活动分类
      </Title>
      <Row gutter={16}>
        {categories.map((category) => (
          <Col xs={24} sm={12} md={6} key={category.value}>
            <Link
              to={`/list?category=${category.value}`}
              onClick={() => handleCategoryClick(category)}
              style={{ textDecoration: 'none' }}
            >
              <Card
                hoverable="true"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  backgroundColor: getCategoryColor(category.value) + '15' // 15% opacity for background
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.backgroundColor = getCategoryColor(category.value) + '25'; // 25% opacity on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.backgroundColor = getCategoryColor(category.value) + '15'; // Reset background
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    marginBottom: '16px',
                    fontSize: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getCategoryIcon(category.value)}
                </div>
                <Title heading={5} style={{ margin: 0, color: getCategoryColor(category.value) }}>
                  {category.label}活动
                </Title>
                <Typography.Text style={{ marginTop: '8px', color: '#666' }}>
                  {category.count}个活动
                </Typography.Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default ActivityCategories;