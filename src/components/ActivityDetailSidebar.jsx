import React from 'react';
import { Card, Typography, Button, Space, Tag } from '@douyinfe/semi-ui';

const { Text } = Typography;

const ActivityDetailSidebar = ({ 
  activity, 
  onExportData, 
  onViewParticipants,
  onViewStatistics 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case '进行中': return 'green';
      case '已结束': return 'grey';
      case '未开始': return 'blue';
      default: return 'grey';
    }
  };

  return (
    <div style={{ width: 300 }}>
      <Card title="活动状态" style={{ marginBottom: 16 }}>
        <Space vertical align="start" style={{ width: '100%' }}>
          <Tag color={getStatusColor(activity?.status)}>
            {activity?.status || '未知'}
          </Tag>
          <Text type="tertiary">
            创建时间: {activity?.createdAt}
          </Text>
          <Text type="tertiary">
            最后更新: {activity?.updatedAt}
          </Text>
        </Space>
      </Card>

      <Card title="快速操作" style={{ marginBottom: 16 }}>
        <Space vertical style={{ width: '100%' }}>
          <Button 
            type="primary" 
            block 
            onClick={onExportData}
          >
            导出数据
          </Button>
          <Button 
            block 
            onClick={onViewParticipants}
          >
            查看参与者
          </Button>
          <Button 
            block 
            onClick={onViewStatistics}
          >
            查看统计
          </Button>
        </Space>
      </Card>

      <Card title="统计信息">
        <Space vertical align="start" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Text>参与人数:</Text>
            <Text strong>{activity?.participants || 0}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Text>完成人数:</Text>
            <Text strong>{activity?.completed || 0}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Text>成功率:</Text>
            <Text strong>{activity?.successRate || '0%'}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Text>平均用时:</Text>
            <Text strong>{activity?.averageTime || '0分钟'}</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ActivityDetailSidebar;