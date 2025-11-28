import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Toast } from '@douyinfe/semi-ui';
import { 
  ActivityDetailHeader, 
  ActivityDetailContent,
  SkeletonLoader,
  LoadingIndicator 
} from '../components';
import { useActivityDetail } from '../hooks';
import './ActivityDetail.css';

const { Content } = Layout;

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saveLoading, setSaveLoading] = useState(false);
  
  // 使用自定义Hook管理活动详情数据
  const {
    activity,
    loading,
    error,
    isEditing,
    formData,
    fetchActivity,
    updateActivity,
    deleteActivity,
    enterEditMode,
    cancelEdit,
    updateFormData,
    updateFormDataBatch
  } = useActivityDetail(id);

  // 处理保存
  const handleSave = async () => {
    if (!formData.title?.trim()) {
      Toast.error('活动标题不能为空');
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // 处理日期格式转换（与原始逻辑保持一致）
      const submitData = {
        ...formData,
        startTime: formData.startTime ? formData.startTime.getTime() : null,
        endTime: formData.endTime ? formData.endTime.getTime() : null
      };
      
      // 使用批量更新方法设置处理后的数据
      updateFormDataBatch(submitData);
      
      const success = await updateActivity();
      if (success) {
        Toast.success('保存成功');
      }
    } catch (error) {
      console.error('保存活动详情失败:', error);
      Toast.error('保存失败');
    } finally {
      setSaveLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    const confirmDelete = window.confirm('确定要删除此活动吗？此操作不可恢复。');
    if (!confirmDelete) return;
    
    const success = await deleteActivity();
    if (success) {
      Toast.success('删除成功');
      navigate('/activities');
    }
  };

  // 处理返回
  const handleBack = () => {
    navigate('/activities');
  };



  // 错误处理
  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        color: 'red' 
      }}>
        {error}
        <br />
        <button 
          onClick={() => fetchActivity()} 
          style={{ marginTop: '10px' }}
        >
          重新加载
        </button>
      </div>
    );
  }

  // 加载中状态
  if (loading && !activity) {
    return <SkeletonLoader />;
  }

  // 没有数据
  if (!activity) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        color: 'red' 
      }}>
        活动不存在或已被删除
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 头部组件 */}
      <ActivityDetailHeader
        activity={activity}
        isEditing={isEditing}
        onEdit={enterEditMode}
        onSave={handleSave}
        onCancel={cancelEdit}
        onDelete={handleDelete}
        loading={loading}
        saveLoading={saveLoading}
      />

      {/* 内容组件 */}
      <ActivityDetailContent
        activity={activity}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={updateFormData}
      />

      {/* 全局加载指示器 */}
      {loading && <LoadingIndicator />}
    </div>
  );
};

export default ActivityDetail;