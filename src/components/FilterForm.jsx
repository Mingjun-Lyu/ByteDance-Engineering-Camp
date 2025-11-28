import React from 'react';
import { Card, Button, Input, Select, DatePicker, Space, Tag } from '@douyinfe/semi-ui';

// 筛选表单组件
const FilterForm = ({ tempFilters, updateTempFilter, handleFilterSubmit, handleReset, pagination, togglePagination, filters }) => {
  const getCategoryLabel = (category) => {
    const categoryMap = {
      promotion: '促销',
      offline: '线下',
      festival: '节日',
      exclusive: '专属'
    };
    return categoryMap[category] || category;
  };

  return (
    <Card className="filter-card">
      <div className="filter-form">
        <Space wrap>
          <div className="filter-item">
            <span>活动分类：</span>
            <Select
              value={tempFilters.category}
              onChange={(value) => updateTempFilter('category', value)}
              style={{ width: '200px' }}
              placeholder="全部分类"
            >
              <Select.Option value="">全部分类</Select.Option>
              <Select.Option value="promotion">促销活动</Select.Option>
              <Select.Option value="offline">线下活动</Select.Option>
              <Select.Option value="festival">节日活动</Select.Option>
              <Select.Option value="exclusive">专属活动</Select.Option>
            </Select>
          </div>
          
          <div className="filter-item">
            <span>活动状态：</span>
            <Select
              value={tempFilters.status}
              onChange={(value) => updateTempFilter('status', value)}
              style={{ width: '200px' }}
              placeholder="全部状态"
            >
              <Select.Option value="">全部状态</Select.Option>
              <Select.Option value="ongoing">进行中</Select.Option>
              <Select.Option value="upcoming">待开始</Select.Option>
              <Select.Option value="ended">已结束</Select.Option>
            </Select>
          </div>
          
          <div className="filter-item">
            <span>关键词：</span>
            <Input
              placeholder="搜索活动标题或描述"
              value={tempFilters.keyword}
              onChange={(value) => updateTempFilter('keyword', value)}
              style={{ width: '200px' }}
            />
          </div>
          
          <div className="filter-item">
            <span>开始时间：</span>
            <DatePicker
              value={tempFilters.startTime ? new Date(tempFilters.startTime) : null}
              onChange={(value) => updateTempFilter('startTime', value ? value.toISOString() : null)}
              style={{ width: '200px' }}
              type="date"
              clearable
            />
          </div>
          
          <div className="filter-item">
            <span>结束时间：</span>
            <DatePicker
              value={tempFilters.endTime ? new Date(tempFilters.endTime) : null}
              onChange={(value) => updateTempFilter('endTime', value ? value.toISOString() : null)}
              style={{ width: '200px' }}
              type="date"
              clearable
            />
          </div>
          
          <Space>
            <Button type="primary" theme="solid" onClick={handleFilterSubmit}>
              筛选
            </Button>
            <Button type="tertiary" onClick={handleReset}>
              重置
            </Button>
            <Button 
              type={pagination.disablePagination ? "primary" : "tertiary"}
              theme="solid" 
              onClick={() => togglePagination(!pagination.disablePagination, filters)}
            >
              {pagination.disablePagination ? "恢复分页" : "取消分页"}
            </Button>
          </Space>
        </Space>
      </div>
    </Card>
  );
};

export default FilterForm;