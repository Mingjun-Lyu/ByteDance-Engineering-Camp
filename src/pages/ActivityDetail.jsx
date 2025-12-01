import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Toast } from 'react-bootstrap';
import { 
  ActivityDetailHeader, 
  ActivityDetailContent,
  SkeletonLoader,
  LoadingIndicator 
} from '../components';
import { useActivityDetail } from '../hooks';
import './ActivityDetail.css';

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
      // 使用React Bootstrap的Toast
      Toast.show('活动标题不能为空', { variant: 'danger' });
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
        Toast.show('保存成功', { variant: 'success' });
      }
    } catch (error) {
      console.error('保存活动详情失败:', error);
      Toast.show('保存失败', { variant: 'danger' });
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
      Toast.show('删除成功', { variant: 'success' });
      navigate('/activities');
    }
  };

  // 处理返回
  const handleBack = () => {
    navigate(-1); // 使用-1返回到上一个页面
  };



  // 错误处理
  if (error) {
    return (
      <Container className="text-center py-5 text-danger">
        {error}
        <br />
        <button 
          className="btn btn-primary mt-3"
          onClick={() => fetchActivity()} 
        >
          重新加载
        </button>
      </Container>
    );
  }

  // 加载中状态
  if (loading && !activity) {
    return <SkeletonLoader />;
  }

  // 没有数据
  if (!activity) {
    return (
      <Container className="text-center py-5 text-danger">
        活动不存在或已被删除
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 activity-detail-page">
      {/* 头部组件 */}
      <ActivityDetailHeader
        activity={activity}
        isEditing={isEditing}
        onEdit={enterEditMode}
        onSave={handleSave}
        onCancel={cancelEdit}
        onDelete={handleDelete}
        onBack={handleBack}
        loading={loading}
        saveLoading={saveLoading}
        className="activity-detail-header"
      />

      {/* 内容组件 */}
      <ActivityDetailContent
        activity={activity}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={updateFormData}
        className="activity-detail-content"
      />

      {/* 全局加载指示器 */}
      {loading && <LoadingIndicator />}
    </Container>
  );
};

export default ActivityDetail;