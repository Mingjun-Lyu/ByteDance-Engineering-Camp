import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, TextArea, Select, DatePicker, Switch, Space, Divider, Toast, Tag } from '@douyinfe/semi-ui';
import activityApiService from '../services/apiService';
import './ActivityDetail.css';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 状态管理
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // 初始化formData为完整的活动结构
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner: '',
    type: '',
    category: '',
    startTime: null,
    endTime: null,
    rules: '',
    status: 'pending',
    isPinned: false
  });
  
  // 初始化formData函数
  const initializeFormData = (activityData) => {
    return {
      title: activityData?.title || '',
      description: activityData?.description || '',
      banner: activityData?.banner || '',
      type: activityData?.type || '',
      category: activityData?.category || '',
      startTime: activityData?.startTime ? new Date(activityData.startTime) : null,
      endTime: activityData?.endTime ? new Date(activityData.endTime) : null,
      rules: activityData?.rules || '',
      status: activityData?.status || 'pending',
      isPinned: activityData?.isPinned || activityData?.isFeatured || false
    };
  };
  
  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const data = await activityApiService.getActivityDetail(id);
      setActivity(data);
      // 使用统一的初始化函数
      setFormData(initializeFormData(data));
    } catch (error) {
      console.error('获取活动详情失败:', error);
      Toast.error('获取活动详情失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始化时加载数据
  useEffect(() => {
    fetchActivityDetail();
  }, [id]);
  
  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode && activity) {
      // 进入编辑模式，将活动数据赋值给formData
      console.log('进入编辑模式，activity数据:', activity);
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        banner: activity.banner || '',
        type: activity.type || '',
        category: activity.category || '',
        startTime: activity.startTime ? new Date(activity.startTime) : null,
        endTime: activity.endTime ? new Date(activity.endTime) : null,
        rules: activity.rules || '',
        status: activity.status || 'pending',
        isPinned: activity.isPinned || activity.isFeatured || false
      });
    }
  };
  
  // 处理保存
  const handleSave = async () => {
    if (!formData.title.trim()) {
      Toast.error('活动标题不能为空');
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // 处理日期格式
      const submitData = {
        ...formData,
        startTime: formData.startTime ? formData.startTime.getTime() : null,
        endTime: formData.endTime ? formData.endTime.getTime() : null
      };
      
      await activityApiService.updateActivityDetail(id, submitData);
      Toast.success('保存成功');
      
      // 重新获取数据并切换到查看模式
      await fetchActivityDetail();
      setIsEditMode(false);
    } catch (error) {
      console.error('保存活动详情失败:', error);
      Toast.error('保存失败');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditMode(false);
    // 如果编辑过程中取消，重新获取原始数据
    fetchActivityDetail();
  };
  
  // 获取状态文本和颜色
  const getStatusConfig = (status) => {
    const statusMap = {
      ongoing: { text: '进行中', color: 'green' },
      pending: { text: '待开始', color: 'blue' },
      upcoming: { text: '待开始', color: 'blue' },
      ended: { text: '已结束', color: 'grey' }
    };
    return statusMap[status] || { text: status, color: 'default' };
  };
  
  // 处理返回按钮点击
  const handleBack = () => {
    navigate('/activities');
  };
  
  // 加载中状态显示
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>;
  }
  
  // 如果没有数据
  if (!activity) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>活动不存在或已被删除</div>;
  }
  
  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题和操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>活动详情</h2>
        <div>
          <Button onClick={handleBack} style={{ marginRight: '10px' }}>
            返回列表
          </Button>
          <Button 
            type={isEditMode ? 'primary' : 'default'} 
            onClick={toggleEditMode}
            style={{ marginRight: '10px' }}
          >
            {isEditMode ? '取消编辑' : '编辑活动'}
          </Button>
          {isEditMode && (
            <Button 
              type="primary" 
              theme="solid"
              onClick={handleSave}
              loading={saveLoading}
            >
              保存
            </Button>
          )}
        </div>
      </div>
      
      {/* 活动基本信息 */}
      <Card style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>基本信息</h2>
        
        {isEditMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right' }}>活动标题</label>
              <Input
                value={formData.title}
                onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                required
                style={{ width: '400px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right' }}>活动类型</label>
              <Select
                value={formData.category || formData.type}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value, type: value }))}
                style={{ width: '400px' }}
              >
                <Select.Option value="promotion">促销活动</Select.Option>
                <Select.Option value="offline">线下活动</Select.Option>
                <Select.Option value="festival">节日活动</Select.Option>
                <Select.Option value="exclusive">专属活动</Select.Option>
              </Select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right' }}>开始时间</label>
              <DatePicker
                value={formData.startTime}
                onChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
                showTime
                style={{ width: '400px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right' }}>结束时间</label>
              <DatePicker
                value={formData.endTime}
                onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
                showTime
                style={{ width: '400px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right', marginTop: '8px' }}>活动描述</label>
              <TextArea
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                rows={4}
                style={{ width: '400px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right', marginTop: '8px' }}>活动规则</label>
              <TextArea
                value={formData.rules}
                onChange={(value) => setFormData(prev => ({ ...prev, rules: value }))}
                rows={6}
                style={{ width: '400px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right' }}>活动状态</label>
              <Select
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                style={{ width: '400px' }}
              >
                <Select.Option value="ongoing">进行中</Select.Option>
                <Select.Option value="pending">待开始</Select.Option>
                <Select.Option value="upcoming">待开始</Select.Option>
                <Select.Option value="ended">已结束</Select.Option>
              </Select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right' }}>是否置顶</label>
              <Switch
                checked={formData.isPinned}
                onChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', textAlign: 'right' }}>Banner图片URL</label>
              <Input
                value={formData.banner}
                onChange={(value) => setFormData(prev => ({ ...prev, banner: value }))}
                style={{ width: '400px' }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>活动标题</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{activity.title}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>活动类型</div>
              <div style={{ fontSize: '16px' }}>{activity.category || activity.type}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>活动状态</div>
              <div style={{ fontSize: '16px' }}>
                {(() => {
                  const { text, color } = getStatusConfig(activity.status);
                  return <Tag color={color}>{text}</Tag>;
                })()}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>活动时间</div>
              <div style={{ fontSize: '16px' }}>
                {activity.startTime ? new Date(activity.startTime).toLocaleString() : '时间待定'} - 
                {activity.endTime ? new Date(activity.endTime).toLocaleString() : '时间待定'}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>创建人</div>
              <div style={{ fontSize: '16px' }}>{activity.creator || '-'}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>创建时间</div>
              <div style={{ fontSize: '16px' }}>
                {activity.createdAt || activity.createTime ? 
                  new Date(activity.createdAt || activity.createTime).toLocaleString() : 
                  '未知'}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>是否置顶</div>
              <div style={{ fontSize: '16px' }}>{(activity.isPinned || activity.isFeatured) ? '是' : '否'}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>活动描述</div>
              <div style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>{activity.description || '暂无描述'}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Banner图片</div>
              <div>
                {activity.banner ? (
                  <img 
                    src={activity.banner} 
                    alt={activity.title} 
                    style={{ maxWidth: '400px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ) : (
                  <span>暂无图片</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {/* 活动规则 */}
      <Card style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>活动规则</h2>
        
        {isEditMode ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right', marginTop: '8px' }}>活动规则</label>
            <TextArea
              value={formData.rules}
              onChange={(value) => setFormData(prev => ({ ...prev, rules: value }))}
              rows={6}
              style={{ width: '600px' }}
            />
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-line' }}>
            {activity.rules ? (
              activity.rules.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>暂无规则</p>
            )}
          </div>
        )}
      </Card>
      
      {/* 活动数据 */}
      <Card>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>活动数据</h2>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>参与人数</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{activity.registeredParticipants || 0}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>浏览量</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{activity.views || 0}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>主办方</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{activity.organizer || '-'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>最大参与人数</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{activity.maxParticipants || 0}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityDetail;