import React, { useRef } from 'react';
import { Card, Table, Button, Input, Select, DatePicker, Space } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import './ActivityList.css';

const ActivityList = () => {
  // 使用静态文本代替真实数据和交互逻辑
  return (
    <div className="activity-list">
      <h2>活动列表</h2>
      
      {/* 筛选表单 */}
      <Card className="filter-card">
        <div className="filter-form">
          <Space wrap>
            <div className="filter-item">
              <span>活动分类：</span>
              <Select
                style={{ width: '200px' }}
                placeholder="全部分类"
                // React 19兼容：避免使用element.ref
              >
                <Select.Option value="promotion">促销活动</Select.Option>
                <Select.Option value="event">线下活动</Select.Option>
                <Select.Option value="festival">节日活动</Select.Option>
                <Select.Option value="exclusive">专属活动</Select.Option>
              </Select>
            </div>
            
            <div className="filter-item">
              <span>活动状态：</span>
              <Select
                style={{ width: '200px' }}
                placeholder="全部状态"
                // React 19兼容：避免使用element.ref
              >
                <Select.Option value="ongoing">进行中</Select.Option>
                <Select.Option value="pending">待开始</Select.Option>
                <Select.Option value="ended">已结束</Select.Option>
              </Select>
            </div>
            
            <div className="filter-item">
              <span>关键词：</span>
              <Input
                placeholder="搜索活动标题或描述"
                style={{ width: '200px' }}
              />
            </div>
            
            <div className="filter-item">
              <span>开始时间：</span>
              <DatePicker
                style={{ width: '200px' }}
              />
            </div>
            
            <div className="filter-item">
              <span>结束时间：</span>
              <DatePicker
                style={{ width: '200px' }}
              />
            </div>
            
            <Space>
              <Button type="primary" theme="solid">
              筛选
            </Button>
            <Button>
              重置
            </Button>
            </Space>
          </Space>
        </div>
      </Card>
      
      {/* 活动列表 */}
      <Card className="table-card">
        <Table
          // React 19兼容配置
          columns={[
            {
              title: '活动标题',
              dataIndex: 'title',
              render: () => <Link to="/detail/1">示例活动标题</Link>
            },
            {
              title: '活动时间',
              dataIndex: 'timeRange',
              render: () => '2024-01-01 - 2024-01-31'
            },
            {
              title: '活动状态',
              dataIndex: 'status',
              render: () => <span className="status-badge ongoing">进行中</span>
            },
            {
              title: '活动分类',
              dataIndex: 'type',
              render: () => <span className="type-badge">促销活动</span>
            },
            {
              title: '创建人',
              dataIndex: 'creator',
              render: () => '管理员'
            },
            {
              title: '参与人数',
              dataIndex: 'participants',
              render: () => '100'
            },
            {
              title: '操作',
              render: () => (
                <Button type="primary" theme="solid">
                  <Link to="/detail/1" style={{ color: '#fff', textDecoration: 'none' }}>查看详情</Link>
                </Button>
              )
            }
          ]}
          dataSource={[
            // 静态数据行，仅作展示
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4' },
            { id: '5' }
          ]}
          pagination={{ 
            total: 100, 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50]
          }}
        />
      </Card>
    </div>
  );
};

export default ActivityList;