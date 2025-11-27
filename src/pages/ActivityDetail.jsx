import React, { useState } from 'react';
import { Card, Button, Input, TextArea, Select, DatePicker, Switch, Space, Tabs, Divider } from '@douyinfe/semi-ui';
import { useParams, Link } from 'react-router-dom';
import './ActivityDetail.css';

const ActivityDetail = () => {
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 使用静态文本代替真实数据
  const handleSave = () => {
    // 模拟保存操作
    setIsEditMode(false);
  };
  
  const handleCancel = () => {
    setIsEditMode(false);
  };
  
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
            <Button>
              <Link to="/list" style={{ color: '#fff', textDecoration: 'none' }}>返回列表</Link>
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="primary" theme="solid" onClick={handleSave}>
              保存
            </Button>
            <Button onClick={handleCancel}>
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
                  <Input placeholder="请输入活动标题" defaultValue="示例活动标题" style={{ width: '300px' }} />
                ) : (
                  <span>示例活动标题</span>
                )}
              </div>
              
              <div className="form-item">
                <span>活动类型：</span>
                {isEditMode ? (
                  <Select placeholder="请选择活动类型" defaultValue="promotion" style={{ width: '200px' }}>
                    <Select.Option value="promotion">促销活动</Select.Option>
                    <Select.Option value="event">线下活动</Select.Option>
                    <Select.Option value="festival">节日活动</Select.Option>
                    <Select.Option value="exclusive">专属活动</Select.Option>
                  </Select>
                ) : (
                  <span>促销活动</span>
                )}
              </div>
            </Space>
            
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div className="form-item">
                <span>开始时间：</span>
                {isEditMode ? (
                  <DatePicker showTime style={{ width: '250px' }} />
                ) : (
                  <span>2024-01-01 00:00:00</span>
                )}
              </div>
              
              <div className="form-item">
                <span>结束时间：</span>
                {isEditMode ? (
                  <DatePicker showTime style={{ width: '250px' }} />
                ) : (
                  <span>2024-01-31 23:59:59</span>
                )}
              </div>
            </Space>
            
            <div className="form-item">
              <span>活动描述：</span>
              {isEditMode ? (
                <TextArea
                  placeholder="请输入活动描述"
                  defaultValue="这是一个示例活动描述，用于展示活动详情页面的功能。"
                  style={{ width: '100%', minHeight: '120px' }}
                />
              ) : (
                <div>这是一个示例活动描述，用于展示活动详情页面的功能。</div>
              )}
            </div>
            
            <div className="form-item">
              <span>活动规则：</span>
              {isEditMode ? (
                <TextArea
                  placeholder="请输入活动规则"
                  defaultValue="1. 参与活动需要注册账号\n2. 每个用户限参与一次\n3. 活动最终解释权归主办方所有"
                  style={{ width: '100%', minHeight: '120px' }}
                />
              ) : (
                <div>
                  <p>1. 参与活动需要注册账号</p>
                  <p>2. 每个用户限参与一次</p>
                  <p>3. 活动最终解释权归主办方所有</p>
                </div>
              )}
            </div>
            
            <div className="form-item">
              <span>活动状态：</span>
              {isEditMode ? (
                <Select placeholder="请选择活动状态" defaultValue="ongoing" style={{ width: '200px' }}>
                  <Select.Option value="ongoing">进行中</Select.Option>
                  <Select.Option value="pending">待开始</Select.Option>
                  <Select.Option value="ended">已结束</Select.Option>
                </Select>
              ) : (
                <span className="status-badge ongoing">进行中</span>
              )}
            </div>
            
            <div className="form-item">
              <span>是否置顶：</span>
              {isEditMode ? (
                <Switch defaultChecked={true} />
              ) : (
                <span>{true ? '是' : '否'}</span>
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
            <div className="stat-value">100</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">浏览量</div>
            <div className="stat-value">1000</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">点赞数</div>
            <div className="stat-value">200</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">分享数</div>
            <div className="stat-value">50</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityDetail;