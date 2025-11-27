import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea, Select, DatePicker, Switch, Space, Divider } from '@douyinfe/semi-ui';
import { useParams, Link, useNavigate } from 'react-router-dom';
import activityApiService from '../services/apiService';
import './ActivityDetail.css';

// 简单的消息提示函数替代message组件
const showMessage = (content, type = 'success') => {
  console.log(`${type}: ${content}`);
};

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const data = await activityApiService.getActivityDetail(id);
      setActivityData(data);
    } catch (error) {
      console.error('获取活动详情失败:', error);
      showMessage('获取活动详情失败', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始化时加载数据
  useEffect(() => {
    fetchActivityDetail();
  }, [id]);
  
  // 处理保存
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 收集表单数据
      const formData = {
        title: document.querySelector('.activity-detail-form .form-item:nth-child(1) input')?.value,
        type: document.querySelector('.activity-detail-form .form-item:nth-child(1) select')?.value,
        startTime: document.querySelector('.activity-detail-form .form-item:nth-child(2) .semi-datepicker')?.value,
        endTime: document.querySelector('.activity-detail-form .form-item:nth-child(2) .semi-datepicker:nth-child(2)')?.value,
        description: document.querySelector('.activity-detail-form .form-item:nth-child(3) textarea')?.value,
        rules: document.querySelector('.activity-detail-form .form-item:nth-child(4) textarea')?.value,
        status: document.querySelector('.activity-detail-form .form-item:nth-child(5) select')?.value,
        isPinned: document.querySelector('.activity-detail-form .form-item:nth-child(6) .semi-switch-inner')?.classList.contains('semi-switch-checked')
      };
      
      await activityApiService.updateActivityDetail(id, formData);
      showMessage('活动信息已更新', 'success');
      
      // 重新获取数据并切换到查看模式
      await fetchActivityDetail();
      setIsEditMode(false);
    } catch (error) {
      console.error('保存活动详情失败:', error);
      showMessage('保存活动详情失败', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditMode(false);
    // 如果编辑过程中取消，可以选择重新获取原始数据
    fetchActivityDetail();
  };
  
  // 获取状态标签样式
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ongoing':
        return { text: '进行中', color: 'green' };
      case 'pending':
      case 'upcoming':
        return { text: '待开始', color: 'blue' };
      case 'ended':
        return { text: '已结束', color: 'grey' };
      default:
        return { text: status, color: 'default' };
    }
  };
  
  // 处理返回按钮点击
  const handleBack = () => {
    navigate('/list');
  };
  
  // 加载中状态显示
  if (loading) {
    return <div className="loading">正在加载活动详情...</div>;
  }
  
  // 如果没有数据
  if (!activityData) {
    return (
      <div className="error">
        <p>活动不存在或已被删除</p>
        <Button onClick={handleBack}>返回列表</Button>
      </div>
    );
  }
  
  return (
    <div className="activity-detail">
      <h2>活动详情</h2>
      
      {/* 操作按钮 */}
      <div className="activity-detail-actions">
        {!isEditMode ? (
          <Space>
            <Button type="primary" theme="solid" onClick={() => setIsEditMode(true)}>
              编辑
            </Button>
            <Button onClick={handleBack}>
              返回列表
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="primary" theme="solid" onClick={handleSave} loading={saving}>
              保存
            </Button>
            <Button onClick={handleCancel} disabled={saving}>
              取消
            </Button>
          </Space>
        )}
      </div>
      
      <Divider />
      
      {/* 活动基本信息 */}
      <Card className="activity-detail-card">
        <h3>基本信息</h3>
        <div className="activity-detail-form">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div className="form-item">
              <span>活动标题：</span>
              {isEditMode ? (
                <Input placeholder="请输入活动标题" defaultValue={activityData.title} style={{ width: '300px' }} />
              ) : (
                <span>{activityData.title}</span>
              )}
            </div>
            
            <div className="form-item">
              <span>活动类型：</span>
              {isEditMode ? (
                <Select placeholder="请选择活动类型" defaultValue={activityData.category || activityData.type} style={{ width: '200px' }}>
                  <Select.Option value="tech">科技</Select.Option>
                  <Select.Option value="art">艺术</Select.Option>
                  <Select.Option value="sports">体育</Select.Option>
                  <Select.Option value="culture">文化</Select.Option>
                  <Select.Option value="education">教育</Select.Option>
                </Select>
              ) : (
                <span>{activityData.category || activityData.type}</span>
              )}
            </div>
            </Space>
            
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div className="form-item">
                <span>开始时间：</span>
                {isEditMode ? (
                  <DatePicker showTime style={{ width: '250px' }} defaultValue={activityData.startTime ? new Date(activityData.startTime) : undefined} />
                ) : (
                  <span>{activityData.startTime}</span>
                )}
              </div>
              
              <div className="form-item">
                <span>结束时间：</span>
                {isEditMode ? (
                  <DatePicker showTime style={{ width: '250px' }} defaultValue={activityData.endTime ? new Date(activityData.endTime) : undefined} />
                ) : (
                  <span>{activityData.endTime}</span>
                )}
              </div>
            </Space>
            
            <div className="form-item">
              <span>活动描述：</span>
              {isEditMode ? (
                <TextArea
                  placeholder="请输入活动描述"
                  defaultValue={activityData.description}
                  style={{ width: '100%', minHeight: '120px' }}
                />
              ) : (
                <div>{activityData.description}</div>
              )}
            </div>
            
            <div className="form-item">
              <span>活动规则：</span>
              {isEditMode ? (
                <TextArea
                  placeholder="请输入活动规则"
                  defaultValue={activityData.rules}
                  style={{ width: '100%', minHeight: '120px' }}
                />
              ) : (
                <div>
                  {activityData.rules && activityData.rules.split('\n').map((rule, index) => (
                    <p key={index}>{rule}</p>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-item">
              <span>活动状态：</span>
              {isEditMode ? (
                <Select placeholder="请选择活动状态" defaultValue={activityData.status} style={{ width: '200px' }}>
                  <Select.Option value="ongoing">进行中</Select.Option>
                  <Select.Option value="pending">待开始</Select.Option>
                  <Select.Option value="upcoming">待开始</Select.Option>
                  <Select.Option value="ended">已结束</Select.Option>
                </Select>
              ) : (
                <span 
                  className={`status-badge ${activityData.status}`}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    backgroundColor: getStatusConfig(activityData.status).color === 'green' ? '#e6f7ee' : 
                                    getStatusConfig(activityData.status).color === 'blue' ? '#e6f4ff' : '#f5f5f5',
                    color: getStatusConfig(activityData.status).color === 'green' ? '#237804' : 
                           getStatusConfig(activityData.status).color === 'blue' ? '#0050b3' : '#8c8c8c'
                  }}
                >
                  {getStatusConfig(activityData.status).text}
                </span>
              )}
            </div>
            
            <div className="form-item">
              <span>是否置顶：</span>
              {isEditMode ? (
                <Switch defaultChecked={activityData.isPinned || activityData.isFeatured} />
              ) : (
                <span>{(activityData.isPinned || activityData.isFeatured) ? '是' : '否'}</span>
              )}
            </div>
          </Space>
        </div>
      </Card>
      
      <Divider />
      
      {/* 活动数据统计 */}
      <Card className="activity-detail-stats">
        <h3>活动数据</h3>
        <div className="activity-stats-grid">
          <div className="stat-item">
            <div className="stat-label">参与人数</div>
            <div className="stat-value">{activityData.registeredParticipants || 0}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">浏览量</div>
            <div className="stat-value">{activityData.views || 0}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">主办方</div>
            <div className="stat-value">{activityData.organizer || '-'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">最大参与人数</div>
            <div className="stat-value">{activityData.maxParticipants || 0}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityDetail;