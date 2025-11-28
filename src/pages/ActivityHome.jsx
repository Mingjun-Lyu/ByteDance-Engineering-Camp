import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
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
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>加载中...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Banner轮播 */}
      <Row>
        <Col>
          <Banner banners={banners} />
        </Col>
      </Row>
      
      {/* 活动分类 */}
      <Row>
        <Col>
          <ActivityCategories categories={categories} />
        </Col>
      </Row>
      
      {/* 公告信息 */}
      <Row>
        <Col>
          <Notice notices={notices} />
        </Col>
      </Row>
      
      {/* 重点活动 */}
      <Row>
        <Col>
          <HighlightActivities activities={highlightActivities} />
        </Col>
      </Row>
    </Container>
  );
};

export default ActivityHome;