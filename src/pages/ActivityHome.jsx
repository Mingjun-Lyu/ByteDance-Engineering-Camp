import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner';
import ActivityCategories from '../components/ActivityCategories';
import Notice from '../components/Notice';
import HighlightActivities from '../components/HighlightActivities';
import { 
  getBanners, 
  getActivityCategories, 
  getNotices, 
  getOngoingHighlightActivities 
} from '../mocks/apiService';

const ActivityHome = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notices, setNotices] = useState([]);
  const [highlightActivities, setHighlightActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 并行请求所有数据
        const [bannersRes, categoriesRes, noticesRes, highlightActivitiesRes] = await Promise.all([
          getBanners(),
          getActivityCategories(),
          getNotices(),
          getOngoingHighlightActivities()
        ]);

        if (bannersRes.success) {
          setBanners(bannersRes.data);
        }
        
        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
        }
        
        if (noticesRes.success) {
          setNotices(noticesRes.data);
        }
        
        if (highlightActivitiesRes.success) {
          setHighlightActivities(highlightActivitiesRes.data);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>;
  }

  return (
    <div>
      {/* Banner轮播 */}
      <Banner banners={banners} />
      
      {/* 活动分类 */}
      <ActivityCategories categories={categories} />
      
      {/* 公告信息 */}
      <Notice notices={notices} />
      
      {/* 重点活动 */}
      <HighlightActivities activities={highlightActivities} />
    </div>
  );
};

export default ActivityHome;