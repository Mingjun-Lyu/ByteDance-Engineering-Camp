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
  onBack,
  className = '' 
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
    <div className={`mb-4 ${className}`}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            onClick={onBack}
            disabled={loading}
            className="me-3 back-btn"
          >
            ← 返回
          </Button>
          <div className="activity-title-section">
            <h2 className="mb-1 activity-title">
              {activity?.title || '活动详情'}
            </h2>
            <small className="text-muted activity-meta">
              ID: {activity?.id} | 创建时间: {formatDate(activity?.createdAt || activity?.createTime)}
            </small>
          </div>
        </div>
        
        <div className="d-flex gap-2 action-buttons">
          {isEditing ? (
            <>
              <Button 
                variant="primary" 
                onClick={onSave}
                disabled={saveLoading || loading}
                className="save-btn"
              >
                {saveLoading ? '保存中...' : '保存'}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={onCancel}
                disabled={saveLoading || loading}
                className="cancel-btn"
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
                className="edit-btn"
              >
                编辑
              </Button>
              <Button 
                variant="danger" 
                onClick={onDelete}
                disabled={loading}
                className="delete-btn"
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