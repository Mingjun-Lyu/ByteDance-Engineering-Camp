import React from 'react';
import { Card, Typography, List, Button, Space } from '@douyinfe/semi-ui';

const { Text } = Typography;

const RelatedActivities = ({ 
  relatedActivities = [], 
  onViewActivity,
  onCreateActivity 
}) => {
  return (
    <Card title="相关活动" style={{ marginTop: 16 }}>
      {relatedActivities.length > 0 ? (
        <List
          dataSource={relatedActivities}
          renderItem={(activity) => (
            <List.Item
              main={
                <Space vertical align="start">
                  <Text strong>{activity.name}</Text>
                  <Text type="tertiary" size="small">
                    {activity.type} | {activity.status}
                  </Text>
                </Space>
              }
              extra={
                <Button 
                  size="small" 
                  onClick={() => onViewActivity(activity.id)}
                >
                  查看
                </Button>
              }
            />
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Text type="tertiary">暂无相关活动</Text>
          <br />
          <Button 
            type="primary" 
            onClick={onCreateActivity}
            style={{ marginTop: 10 }}
          >
            创建新活动
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RelatedActivities;