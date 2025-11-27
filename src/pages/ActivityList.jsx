import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Input, Select, DatePicker, Space, Tag, Pagination } from '@douyinfe/semi-ui';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import activityApiService from '../services/apiService';
import './ActivityList.css';

const ActivityList = () => {
  // 首先定义状态和钩子
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 从URL中获取筛选参数
  const initialStatus = searchParams.get('status') || '';
  const initialKeyword = searchParams.get('keyword') || '';
  const initialStartTime = searchParams.get('startTime') || '';
  const initialEndTime = searchParams.get('endTime') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const initialPageSize = parseInt(searchParams.get('pageSize')) || 10;
  
  // 筛选状态
  const [status, setStatus] = useState(initialStatus);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [category, setCategory] = useState(initialCategory);
  
  // 分页状态
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  
  // 数据状态
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 获取活动列表 - 简化实现，直接使用最新状态值
  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // 直接使用当前最新的状态值
      const currentParams = {};
      
      // 只添加有值的参数，避免传递空字符串
      if (page !== undefined) currentParams.page = page;
      if (pageSize !== undefined) currentParams.pageSize = pageSize;
      if (category) currentParams.category = category;
      if (status) currentParams.status = status;
      if (keyword) currentParams.keyword = keyword;
      if (startTime) currentParams.startDate = startTime;
      if (endTime) currentParams.endDate = endTime;
      
      const res = await activityApiService.getActivityList(currentParams);
      
      setActivities(res.list);
      setTotal(res.pagination.total);
    } catch (error) {
      console.error('获取活动列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 初始化时加载数据
  useEffect(() => {
    fetchActivities();
  }, []); // 初始化只执行一次

  // 监听URL参数变化，更新分页状态
  // 这个useEffect只处理从外部直接导航到带参数的URL的情况
  // 避免在内部更新URL时触发，所以移除page和pageSize作为依赖项
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page')) || 1;
    const urlPageSize = parseInt(searchParams.get('pageSize')) || 10;
    
    // 直接更新状态，因为没有page和pageSize作为依赖，不会在内部更新时形成循环
    setPage(urlPage);
    setPageSize(urlPageSize);
  }, [searchParams]);
  
  // 监听关键状态变化，自动重新获取数据
  // 这确保了当任何筛选条件或分页参数变化时，数据都会更新
  useEffect(() => {
    fetchActivities();
  }, [page, pageSize, category, status, keyword, startTime, endTime]); // 监听所有关键状态
  
  // 筛选表单提交
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newPage = 1;
    
    // 首先更新状态
    setPage(newPage);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (keyword) params.set('keyword', keyword);
    if (startTime) params.set('startTime', startTime);
    if (endTime) params.set('endTime', endTime);
    params.set('page', newPage);
    params.set('pageSize', pageSize);
    
    navigate({ search: params.toString() }, { replace: true });
    
    // 数据会通过useEffect自动更新，不需要手动调用
  };
  
  // 重置筛选条件
  const handleResetFilter = () => {
    const newPage = 1;
    
    // 首先清空所有筛选条件状态
    setCategory('');
    setStatus('');
    setKeyword('');
    setStartTime('');
    setEndTime('');
    setPage(newPage);
    
    // 更新URL参数 - 只保留分页信息
    const params = new URLSearchParams();
    params.set('page', newPage);
    params.set('pageSize', pageSize);
    
    navigate({ search: params.toString() }, { replace: true });
    
    // 数据会通过useEffect自动更新，不需要手动调用
  };
  
  // 分页变化时更新数据
  const handlePageChange = (current, newPageSize) => {
    // 直接更新状态
    setPage(current);
    
    // 更新pageSize
    setPageSize(newPageSize);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (keyword) params.set('keyword', keyword);
    if (startTime) params.set('startTime', startTime);
    if (endTime) params.set('endTime', endTime);
    params.set('page', current);
    params.set('pageSize', newPageSize);
    
    navigate({ search: params.toString() }, { replace: true });
    
    // 数据会通过useEffect自动更新，不需要手动调用fetchActivities
  };
  
  // 获取状态文本和颜色
  const getStatusConfig = (status) => {
    const statusMap = {
      ongoing: { text: '进行中', color: 'green' },
      upcoming: { text: '待开始', color: 'blue' },
      ended: { text: '已结束', color: 'grey' }
    };
    return statusMap[status] || { text: status, color: 'default' };
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      tech: '科技',
      art: '艺术',
      sports: '体育',
      culture: '文化',
      education: '教育'
    };
    return categoryMap[category] || category;
  };

  // 渲染筛选表单组件
  const renderFilterForm = () => {
    return (
      <Card className="filter-card">
        <div className="filter-form">
          <Space wrap>
            <div className="filter-item">
              <span>活动分类：</span>
              <Select
                value={category}
                onChange={(value) => setCategory(value)}
                style={{ width: '200px' }}
                placeholder="全部分类"
              >
                <Select.Option value="">全部分类</Select.Option>
                <Select.Option value="tech">科技</Select.Option>
                <Select.Option value="art">艺术</Select.Option>
                <Select.Option value="sports">体育</Select.Option>
                <Select.Option value="culture">文化</Select.Option>
                <Select.Option value="education">教育</Select.Option>
              </Select>
            </div>
            
            <div className="filter-item">
              <span>活动状态：</span>
              <Select
                value={status}
                onChange={(value) => setStatus(value)}
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
                value={keyword}
                onChange={(value) => setKeyword(value)}
                style={{ width: '200px' }}
              />
            </div>
            
            <div className="filter-item">
              <span>开始时间：</span>
              <DatePicker
                value={startTime ? new Date(startTime) : null}
                onChange={(value) => setStartTime(value ? value.toISOString().split('T')[0] : '')}
                style={{ width: '200px' }}
              />
            </div>
            
            <div className="filter-item">
              <span>结束时间：</span>
              <DatePicker
                value={endTime ? new Date(endTime) : null}
                onChange={(value) => setEndTime(value ? value.toISOString().split('T')[0] : '')}
                style={{ width: '200px' }}
              />
            </div>
            
            <Space>
              <Button type="primary" theme="solid" onClick={handleFilterSubmit}>
                筛选
              </Button>
              <Button onClick={handleResetFilter}>
                重置
              </Button>
            </Space>
          </Space>
        </div>
      </Card>
    );
  };
  
  // 渲染活动表格组件
  const renderActivityTable = () => {
    const columns = [
      {
        title: '活动标题',
        dataIndex: 'title',
        render: (title, record) => (
          <Link to={`/detail/${record.id}`}>{title}</Link>
        )
      },
      {
        title: '活动时间',
        dataIndex: 'startTime',
        render: (value, record) => (
          `${new Date(record.startTime).toLocaleDateString()} - ${new Date(record.endTime).toLocaleDateString()}`
        )
      },
      {
        title: '活动状态',
        dataIndex: 'status',
        render: (status) => {
          const { text, color } = getStatusConfig(status);
          return <Tag color={color}>{text}</Tag>;
        }
      },
      {
        title: '活动分类',
        dataIndex: 'category',
        render: (category) => {
          return <Tag color="blue">{getCategoryLabel(category)}</Tag>;
        }
      },
      {
        title: '主办方',
        dataIndex: 'organizer'
      },
      {
        title: '参与人数',
        dataIndex: 'registeredParticipants'
      },
      {
        title: '操作',
        render: (value, record) => (
          <Button type="primary" theme="solid">
            <Link to={`/detail/${record.id}`} style={{ color: '#fff', textDecoration: 'none' }}>查看详情</Link>
          </Button>
        )
      }
    ];
    
    return (
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={activities}
          pagination={false}
          loading={loading}
          locale={{ emptyText: '暂无活动数据' }}
        />
      </Card>
    );
  };
  
  // 渲染分页控件组件
  const renderPagination = () => {
    // 只有在数据加载完成且有数据时才显示分页控件
    if (loading || total <= 0) {
      return null;
    }
    
    return (
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <Pagination
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50']}
          showTotal={true}
        />
      </div>
    );
  };
  
  // 最后返回渲染结果
  return (
    <div className="activity-list">
      <h2>活动列表</h2>
      
      {/* 筛选表单 */}
      {renderFilterForm()}
      
      {/* 活动列表 */}
      {renderActivityTable()}
      {renderPagination()}
    </div>
  );
};

export default ActivityList;