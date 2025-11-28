import React from 'react';
import { Carousel } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';

const Banner = ({ banners }) => {
  if (!banners || banners.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '200px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#999'
      }}>
        没有轮播图数据
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', overflow: 'hidden', marginBottom: '20px' }}>
      <Carousel 
        autoplay
        autoplayInterval={3000} 
        dotPosition="bottom" 
        style={{ width: '100%', height: '300px' }}
        indicators={true}
        controls={true}
        theme="dark"
      >
        {banners.map((banner) => (
          <Link 
            key={banner.id} 
            to={banner.link || '/'} 
            style={{ 
              display: 'block',
              width: '100%',
              height: '100%',
              textDecoration: 'none'
            }}
          >
            <div 
              style={{ 
                width: '100%',
                height: '100%',
                backgroundImage: `url('${banner.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                  {banner.title || '活动标题'}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </Carousel>
    </div>
  );
};

export default Banner;