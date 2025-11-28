import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const Notice = ({ notices }) => {
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
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h4 className="mb-0">公告信息</h4>
      </Card.Header>
      <ListGroup variant="flush">
        {notices.map((notice) => (
          <ListGroup.Item 
            key={notice.id}
            className="border-0"
            style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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