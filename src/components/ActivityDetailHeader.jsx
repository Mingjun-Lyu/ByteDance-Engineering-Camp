import React from 'react';
import { Button } from 'react-bootstrap';

const ActivityDetailHeader = ({ 
  activity, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  loading,
  saveLoading,
  onBack 
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
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            onClick={onBack}
            disabled={loading}
            className="me-3"
          >
            ← 返回
          </Button>
          <div>
            <h2 className="mb-1">
              {activity?.title || '活动详情'}
            </h2>
            <small className="text-muted">
              ID: {activity?.id} | 创建时间: {formatDate(activity?.createdAt || activity?.createTime)}
            </small>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="primary" 
                onClick={onSave}
                disabled={saveLoading || loading}
              >
                {saveLoading ? '保存中...' : '保存'}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={onCancel}
                disabled={saveLoading || loading}
              >
                取消
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="primary" 
                onClick={onEdit}
                disabled={loading}
              >
                编辑
              </Button>
              <Button 
                variant="danger" 
                onClick={onDelete}
                disabled={loading}
              >
                删除
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailHeader;