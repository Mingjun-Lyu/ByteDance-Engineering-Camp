import React from 'react';
import { Carousel } from '@douyinfe/semi-ui';
import './Banner.css';

const Banner = ({ banners = [] }) => {
  // 使用默认的静态轮播图数据，确保组件始终有内容显示
  const defaultBanners = [
    {
      id: 1,
      imageUrl: 'https://via.placeholder.com/1200x400?text=Banner+1',
      title: '夏季促销活动',
      link: '/detail/1'
    },
    {
      id: 2,
      imageUrl: 'https://via.placeholder.com/1200x400?text=Banner+2',
      title: '新品上市活动',
      link: '/detail/2'
    },
    {
      id: 3,
      imageUrl: 'https://via.placeholder.com/1200x400?text=Banner+3',
      title: '会员专享活动',
      link: '/detail/3'
    }
  ];

  // 如果没有传入banners或banners为空数组，则使用默认数据
  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  return (
    <div className="banner-container">
      <Carousel
        autoplay
        autoplayInterval={5000}
        dots
        arrows
        pauseOnHover
      >
        {displayBanners.map(banner => (
          <div key={banner.id} className="banner-item">
            <div 
              className="banner-image" 
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
            >
              <div className="banner-content">
                <h2 className="banner-title">{banner.title}</h2>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Banner;