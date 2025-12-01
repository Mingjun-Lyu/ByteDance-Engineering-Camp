import React from 'react';
import { Carousel, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Banner = ({ banners }) => {
  if (!banners || banners.length === 0) {
    return (
      <Card className="text-center p-5 mb-4">
        <Card.Body>
          <Card.Text className="text-muted">没有轮播图数据</Card.Text>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Carousel className="mb-4 banner-carousel" interval={3000} indicators={true} controls={true}>
      {banners.map((banner, index) => (
        <Carousel.Item key={banner.id} className={index === 0 ? 'first-banner-item' : 'banner-item'}>
          <Link to={banner.link || '/'} style={{ textDecoration: 'none' }} className="banner-link">
            <div 
              className="d-flex align-items-center justify-content-center banner-image-container"
              style={{ 
                height: '300px',
                backgroundImage: `url('${banner.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onError={(e) => {
                // 图片加载失败时显示默认背景
                e.currentTarget.style.backgroundImage = 'none';
                e.currentTarget.style.backgroundColor = '#e6f7ff';
              }}
            >
              {/* 添加半透明遮罩层增强标题可读性 */}
              <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white p-4 text-center banner-overlay">
                <h3 className="h4 mb-0 fw-bold banner-title">
                  {banner.title || '活动标题'}
                </h3>
              </div>
            </div>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default Banner;