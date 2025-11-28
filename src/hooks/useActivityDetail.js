import { useState, useEffect, useCallback } from 'react';
import activityApiService from '../services/apiService';

export const useActivityDetail = (activityId) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // 初始化表单数据（与原始逻辑保持一致）
  const initializeFormData = (activityData) => {
    if (!activityData) return {};
    
    return {
      title: activityData.title || '',
      description: activityData.description || '',
      category: activityData.category || activityData.type || '',
      status: activityData.status || 'pending',
      startTime: activityData.startTime ? new Date(activityData.startTime) : null,
      endTime: activityData.endTime ? new Date(activityData.endTime) : null,
      rules: activityData.rules || '',
      banner: activityData.banner || '',
      isPinned: activityData.isPinned || activityData.isFeatured || false,
      creator: activityData.creator || '',
      organizer: activityData.organizer || '',
      maxParticipants: activityData.maxParticipants || 0,
      registeredParticipants: activityData.registeredParticipants || 0,
      views: activityData.views || 0
    };
  };

  // 获取活动详情
  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activityApiService.getActivityDetail(activityId);
      setActivity(response);
      setFormData(initializeFormData(response));
      setError(null);
    } catch (err) {
      setError(err.message || '获取活动详情失败');
      console.error('获取活动详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  // 更新活动信息
  const updateActivity = async () => {
    try {
      setSaveLoading(true);
      
      // 处理日期格式（与原始逻辑保持一致）
      const processedData = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null
      };
      
      // 表单验证
      if (!processedData.title || processedData.title.trim() === '') {
        setError('活动标题不能为空');
        return false;
      }
      
      await activityApiService.updateActivityDetail(activityId, processedData);
      
      // 更新成功后重新获取最新数据
      const updatedActivity = await activityApiService.getActivityDetail(activityId);
      setActivity(updatedActivity);
      setFormData(initializeFormData(updatedActivity));
      setIsEditing(false);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || '更新活动失败');
      console.error('更新活动失败:', err);
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  // 删除活动
  const deleteActivity = async () => {
    try {
      setLoading(true);
      await activityApiService.deleteActivity(activityId);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || '删除活动失败');
      console.error('删除活动失败:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 进入编辑模式
  const enterEditMode = () => {
    setIsEditing(true);
    setFormData(initializeFormData(activity));
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditing(false);
    setFormData(initializeFormData(activity));
    setError(null);
  };

  // 更新表单数据
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 批量更新表单数据
  const updateFormDataBatch = (data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  // 初始化数据
  useEffect(() => {
    if (activityId) {
      fetchActivity();
    }
  }, [activityId, fetchActivity]);

  return {
    activity,
    loading,
    saveLoading,
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
  };
};