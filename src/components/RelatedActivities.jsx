import React from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';

const RelatedActivities = ({ 
  relatedActivities = [], 
  onViewActivity,
  onCreateActivity 
}) => {
  return (
    <Card className="mt-3">
      <Card.Header>
        <h6 className="mb-0">相关活动</h6>
      </Card.Header>
      <Card.Body className="p-0">
        {relatedActivities.length > 0 ? (
          <ListGroup variant="flush">
            {relatedActivities.map((activity) => (
              <ListGroup.Item key={activity.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">{activity.name}</div>
                  <small className="text-muted">
                    {activity.type} | {activity.status}
                  </small>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => onViewActivity(activity.id)}
                >
                  查看
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center p-4">
            <p className="text-muted">暂无相关活动</p>
            <Button 
              variant="primary" 
              onClick={onCreateActivity}
              className="mt-2"
            >
              创建新活动
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RelatedActivities;