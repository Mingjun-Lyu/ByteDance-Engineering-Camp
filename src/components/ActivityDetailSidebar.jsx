import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const ActivityDetailSidebar = ({ 
  activity, 
  onExportData, 
  onViewParticipants,
  onViewStatistics 
}) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case '进行中': return 'success';
      case '已结束': return 'secondary';
      case '未开始': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div style={{ width: 300 }}>
      <Card className="mb-3">
        <Card.Header>
          <h6 className="mb-0">活动状态</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-column gap-2">
            <Badge bg={getStatusVariant(activity?.status)}>
              {activity?.status || '未知'}
            </Badge>
            <small className="text-muted">
              创建时间: {activity?.createdAt}
            </small>
            <small className="text-muted">
              最后更新: {activity?.updatedAt}
            </small>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>
          <h6 className="mb-0">快速操作</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              onClick={onExportData}
            >
              导出数据
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={onViewParticipants}
            >
              查看参与者
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={onViewStatistics}
            >
              查看统计
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h6 className="mb-0">统计信息</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <span>参与人数:</span>
              <strong>{activity?.participants || 0}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>完成人数:</span>
              <strong>{activity?.completed || 0}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>成功率:</span>
              <strong>{activity?.successRate || '0%'}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>平均用时:</span>
              <strong>{activity?.averageTime || '0分钟'}</strong>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ActivityDetailSidebar;