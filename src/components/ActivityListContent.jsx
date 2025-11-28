import React from 'react';
import { Card, Table, Button, Tag, Spin, Select } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';
import VirtualList from './VirtualList';

// 活动列表内容组件
const ActivityListContent = ({ 
  activities, 
  allActivities, 
  loading, 
  loadingAll,
  pagination, 
  handlePageChange, 
  filters,
  total 
}) => {
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
      promotion: '促销',
      offline: '线下',
      festival: '节日',
      exclusive: '专属'
    };
    return categoryMap[category] || category;
  };

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
      render: (value, record) => {
        try {
          const startDate = record.startTime ? new Date(record.startTime).toLocaleDateString() : '时间待定';
          const endDate = record.endTime ? new Date(record.endTime).toLocaleDateString() : '时间待定';
          return `${startDate} - ${endDate}`;
        } catch (error) {
          console.error('日期格式化错误:', error);
          return '时间格式错误';
        }
      }
    },
    {
      title: '活动状态',
      dataIndex: 'status',
      render: (status) => {
        try {
          const { text, color } = getStatusConfig(status);
          return <Tag color={color}>{text}</Tag>;
        } catch (error) {
          console.error('状态显示错误:', error);
          return <Tag color="default">未知</Tag>;
        }
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

  // 渲染单个活动项
  const renderActivityItem = (activity) => {
    const { text: statusText, color: statusColor } = getStatusConfig(activity.status);
    const categoryLabel = getCategoryLabel(activity.category);
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            <Link to={`/detail/${activity.id}`}>{activity.title}</Link>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {`${new Date(activity.startTime).toLocaleDateString()} - ${new Date(activity.endTime).toLocaleDateString()}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Tag color={statusColor} size="small">{statusText}</Tag>
          <Tag color="blue" size="small">{categoryLabel}</Tag>
          <span style={{ fontSize: '12px', color: '#999' }}>{activity.organizer}</span>
          <span style={{ fontSize: '12px', color: '#999' }}>{activity.registeredParticipants}人</span>
          <Button type="primary" theme="solid" size="small">
            <Link to={`/detail/${activity.id}`} style={{ color: '#fff', textDecoration: 'none' }}>查看</Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="table-card">
      {loading || (pagination.disablePagination && loadingAll) ? (
        <SkeletonLoader count={pagination.pageSize} />
      ) : pagination.disablePagination ? (
        // 取消分页模式 - 使用虚拟滚动
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>所有活动 ({allActivities.length}项)</span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              使用虚拟滚动优化，仅渲染可见区域内容
            </span>
          </div>
          {allActivities.length > 0 ? (
            <VirtualList
              items={allActivities}
              itemHeight={80}
              containerHeight={500}
              renderItem={renderActivityItem}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              暂无活动数据
            </div>
          )}
        </>
      ) : (
        // 分页模式
        <>
          <Table
            columns={columns}
            dataSource={activities}
            pagination={false}
            loading={false}
            locale={{ emptyText: '暂无活动数据' }}
          />
          {!pagination.disablePagination && activities.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              {/* 自定义页码控件 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                backgroundColor: '#f9f9f9'
              }}>
                {/* 页面大小选择器 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>每页显示:</span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onChange={(value) => {
                      handlePageChange(1, parseInt(value), filters);
                    }}
                    style={{ width: '80px' }}
                  >
                    <Select.Option value="10">10</Select.Option>
                    <Select.Option value="20">20</Select.Option>
                    <Select.Option value="50">50</Select.Option>
                  </Select>
                </div>
                
                {/* 页码导航 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button
                    disabled={pagination.currentPage <= 1}
                    onClick={() => {
                      handlePageChange(pagination.currentPage - 1, pagination.pageSize, filters);
                    }}
                  >
                    上一页
                  </Button>
                  
                  {/* 页码显示 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>第</span>
                    <span style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: '#1890ff',
                      padding: '4px 8px',
                      border: '1px solid #1890ff',
                      borderRadius: '4px'
                    }}>
                      {pagination.currentPage}
                    </span>
                    <span style={{ fontSize: '14px', color: '#666' }}>页，共 {pagination.totalPages} 页</span>
                  </div>
                  
                  <Button
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => {
                      handlePageChange(pagination.currentPage + 1, pagination.pageSize, filters);
                    }}
                  >
                    下一页
                  </Button>
                </div>
                
                {/* 总记录数 */}
                <div style={{ fontSize: '14px', color: '#666' }}>
                  共 {total} 条记录
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ActivityListContent;