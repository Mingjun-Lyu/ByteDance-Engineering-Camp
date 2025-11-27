import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, DatePicker, Space, Tag, Pagination } from '@douyinfe/semi-ui';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import activityApiService from '../services/apiService';
import './ActivityList.css';

const ActivityList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  
  // 获取活动列表
  const fetchActivities = async (overrideParams = {}) => {
    try {
      setLoading(true);
      
      // 使用当前状态值，结合可选的覆盖参数
      const currentParams = {
        page,
        pageSize,
        category,
        status,
        keyword,
        startDate: startTime,
        endDate: endTime,
        ...overrideParams // 允许传入参数覆盖当前状态
      };
      
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
  }, []);
  
  // 筛选表单提交
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newPage = 1;
    
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
    
    // 更新状态并获取数据
    setPage(newPage);
    // 直接传递最新的参数，确保使用的是新的页码
    fetchActivities({ page: newPage, category, status, keyword, startDate: startTime, endDate: endTime });
  };
  
  // 重置筛选条件
  const handleResetFilter = () => {
    const newPage = 1;
    
    // 清空所有筛选条件状态
    setCategory('');
    setStatus('');
    setKeyword('');
    setStartTime('');
    setEndTime('');
    setPage(newPage);
    
    // 更新URL参数
    const params = new URLSearchParams();
    params.set('page', newPage);
    params.set('pageSize', pageSize);
    
    navigate({ search: params.toString() }, { replace: true });
    
    // 重置状态后重新获取数据
    setTimeout(() => {
      fetchActivities();
    }, 0);
  };
  
  // 分页变化时更新数据
  const handlePageChange = (current, newPageSize) => {
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
    
    // 更新分页状态并获取数据
    setPage(current);
    setPageSize(newPageSize);
    // 直接传递最新的分页参数
    fetchActivities({ page: current, pageSize: newPageSize, category, status, keyword, startDate: startTime, endDate: endTime });
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
      
      {/* 活动列表 */}
      <Card className="table-card">
        <Table
          columns={[
            {
              title: '活动标题',
              dataIndex: 'title',
              render: (title, record) => (
                <Link to={`/detail/${record.id}`}>{title}</Link>
              )
            },
            {
              title: '活动时间',
              dataIndex: ['startTime', 'endTime'],
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
          ]}
          dataSource={activities}
          pagination={false}
          loading={loading}
          locale={{ emptyText: '暂无活动数据' }}
        />
        
        {/* 分页控件 */}
        {!loading && total > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Pagination
              total={total}
              current={page}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={[10, 20, 50]}
              showTotal={(total) => `共 ${total} 条记录`}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityList;