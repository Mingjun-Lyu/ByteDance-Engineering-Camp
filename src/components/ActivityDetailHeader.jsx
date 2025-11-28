import React from 'react';
import { Typography, Space, Button } from '@douyinfe/semi-ui';

const { Title, Text } = Typography;

const ActivityDetailHeader = ({ 
  activity, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  loading,
  saveLoading 
}) => {
  // 格式化日期显示
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Title heading={2} style={{ margin: 0 }}>
            {activity?.title || '活动详情'}
          </Title>
          <Text type="tertiary">
            ID: {activity?.id} | 创建时间: {formatDate(activity?.createdAt || activity?.createTime)}
          </Text>
        </div>
        
        <Space>
          {isEditing ? (
            <>
              <Button 
                type="primary" 
                onClick={onSave}
                loading={saveLoading || loading}
              >
                保存
              </Button>
              <Button 
                onClick={onCancel}
                disabled={saveLoading || loading}
              >
                取消
              </Button>
            </>
          ) : (
            <>
              <Button 
                type="primary" 
                onClick={onEdit}
                disabled={loading}
              >
                编辑
              </Button>
              <Button 
                type="danger" 
                onClick={onDelete}
                disabled={loading}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      </Space>
    </div>
  );
};

export default ActivityDetailHeader;