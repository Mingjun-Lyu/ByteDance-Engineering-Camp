import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Notice = ({ notices }) => {
  const navigate = useNavigate();
  
  if (!notices || notices.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '日期未知';
      }
      return date.toLocaleString();
    } catch {
      return '日期未知';
    }
  };

  const handleNoticeClick = (notice) => {
    // 如果是活动相关的公告，路由到对应的活动详情页
    if (notice.type === 'activity' && notice.id) {
      // 从公告ID中提取活动ID（公告ID格式为活动ID * 10 + 序号）
      const activityId = Math.floor(notice.id / 10);
      navigate(`/detail/${activityId}`);
    }
    // 如果是系统公告，可以添加其他处理逻辑
  };
  
  return (
    <Card className="mb-4 notice-section">
      <Card.Header className="bg-light">
        <h4 className="mb-0">公告信息</h4>
      </Card.Header>
      <ListGroup variant="flush">
        {notices.map((notice, index) => (
          <ListGroup.Item 
            key={notice.id}
            className={`border-0 notice-item ${index === 0 ? 'first-notice' : ''}`}
            style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            onClick={() => handleNoticeClick(notice)}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="mb-0 fw-bold">{notice.title}</h6>
              <small className="text-muted">{formatDate(notice.createdAt || notice.createTime)}</small>
            </div>
            <p className="mb-0 text-muted small">{notice.content}</p>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default Notice;