import React from 'react';
import { Carousel } from '@douyinfe/semi-ui';

const Banner = ({ banners }) => {
  if (!banners || banners.length === 0) {
    return <div>没有轮播图数据</div>;
  }
  
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Carousel 
        autoplay
        autoplayInterval={3000} 
        dotPosition="bottom" 
        style={{ width: '100%', height: '400px' }}
        indicators={true}
        controls={true}
        theme="dark"
      >
        {banners.map((banner, index) => (
          <div 
            key={banner.id} 
            style={{ 
              backgroundImage: `url('${banner.image}')`,
              backgroundSize: 'cover'
            }}
          >
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Banner;