import React from 'react';
import { Card, Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';
import VirtualList from './VirtualList';

// 活动列表内容组件
const ActivityListContent = ({ 
  activities, 
  allActivities, 
  loading, 
  loadingAll,
  loadingMore,
  pagination, 
  handlePageChange, 
  filters,
  total,
  hasMore,
  fetchLazyActivities,
  error
}) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      ongoing: { text: '进行中', variant: 'success' },
      upcoming: { text: '待开始', variant: 'primary' },
      ended: { text: '已结束', variant: 'secondary' }
    };
    return statusMap[status] || { text: status, variant: 'secondary' };
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

  // 懒加载处理函数
  const handleLoadMore = () => {
    if (pagination.disablePagination && hasMore && !loadingMore) {
      fetchLazyActivities(filters, { append: true });
    }
  };

  // 渲染表格行
  const renderTableRow = (activity) => {
    const { text: statusText, variant: statusVariant } = getStatusConfig(activity.status);
    const categoryLabel = getCategoryLabel(activity.category);
    
    return (
      <tr key={activity.id}>
        <td>
          <Link to={`/detail/${activity.id}`} className="text-decoration-none">
            {activity.title}
          </Link>
        </td>
        <td>
          {activity.startTime ? new Date(activity.startTime).toLocaleDateString() : '时间待定'} - 
          {activity.endTime ? new Date(activity.endTime).toLocaleDateString() : '时间待定'}
        </td>
        <td>
          <Badge bg={statusVariant}>{statusText}</Badge>
        </td>
        <td>
          <Badge bg="primary">{categoryLabel}</Badge>
        </td>
        <td>{activity.creator}</td>
        <td>{activity.registeredParticipants}</td>
        <td>
          <Button variant="primary" size="sm">
            <Link to={`/detail/${activity.id}`} className="text-decoration-none text-white">
              查看详情
            </Link>
          </Button>
        </td>
      </tr>
    );
  };

  // 渲染单个活动项
  const renderActivityItem = (activity) => {
    const { text: statusText, variant: statusVariant } = getStatusConfig(activity.status);
    const categoryLabel = getCategoryLabel(activity.category);
    
    return (
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
        <div className="flex-grow-1">
          <div className="fw-bold mb-1">
            <Link to={`/detail/${activity.id}`} className="text-decoration-none">
              {activity.title}
            </Link>
          </div>
          <div className="small text-muted">
            {`${new Date(activity.startTime).toLocaleDateString()} - ${new Date(activity.endTime).toLocaleDateString()}`}
          </div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Badge bg={statusVariant}>{statusText}</Badge>
          <Badge bg="primary">{categoryLabel}</Badge>
          <span className="small text-muted">{activity.creator}</span>
          <span className="small text-muted">{activity.registeredParticipants}人</span>
          <Button variant="primary" size="sm">
            <Link to={`/detail/${activity.id}`} className="text-decoration-none text-white">
              查看
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  // 渲染错误提示
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <div className="flex-grow-1">
          <strong>加载失败:</strong> {error}
        </div>
        <Button 
          variant="outline-danger" 
          size="sm" 
          onClick={() => {
            if (pagination.disablePagination) {
              fetchLazyActivities(filters, { reset: true });
            } else {
              handlePageChange(pagination.currentPage, pagination.pageSize, filters);
            }
          }}
        >
          重试
        </Button>
      </div>
    );
  };

  // 渲染加载更多状态指示器
  const renderLoadMoreIndicator = () => {
    if (!pagination.disablePagination || !loadingMore) return null;
    
    return (
      <div className="d-flex justify-content-center align-items-center py-3">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted">正在加载更多数据...</span>
      </div>
    );
  };

  // 渲染无更多数据提示
  const renderNoMoreData = () => {
    if (!pagination.disablePagination || hasMore || allActivities.length === 0) return null;
    
    return (
      <div className="text-center py-3 text-muted">
        <span>已加载全部数据</span>
      </div>
    );
  };

  return (
    <Card className="table-card">
      <Card.Body>
        {/* 错误提示 */}
        {renderError()}
        
        {loading || (pagination.disablePagination && loadingAll) ? (
          <SkeletonLoader count={pagination.pageSize} />
        ) : pagination.disablePagination ? (
          // 取消分页模式 - 使用虚拟滚动
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-bold">所有活动 ({allActivities.length}项)</span>
              <span className="small text-muted">
                使用虚拟滚动优化，数据懒加载并仅渲染可见区域内容
              </span>
            </div>
            {allActivities.length > 0 || loadingMore ? (
              <>
                <VirtualList
                  items={allActivities}
                  itemHeight={80}
                  containerHeight={500}
                  renderItem={renderActivityItem}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                />
                {renderLoadMoreIndicator()}
                {renderNoMoreData()}
              </>
            ) : (
              <div className="text-center py-5 text-muted">
                暂无活动数据
              </div>
            )}
          </>
        ) : (
          // 分页模式
          <>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>活动标题</th>
                  <th>活动时间</th>
                  <th>活动状态</th>
                  <th>活动分类</th>
                  <th>创建人</th>
                  <th>参与人数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {activities.length > 0 ? (
                  activities.map(renderTableRow)
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      暂无活动数据
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {!pagination.disablePagination && activities.length > 0 && (
              <div className="mt-4">
                {/* 分页控件 */}
                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                  <div className="d-flex align-items-center gap-3">
                    {/* 页面大小选择器 */}
                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-muted">每页显示:</span>
                      <Form.Select
                        value={pagination.pageSize}
                        onChange={(e) => {
                          handlePageChange(1, parseInt(e.target.value), filters);
                        }}
                        style={{ width: '80px' }}
                        size="sm"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </Form.Select>
                    </div>
                    
                    {/* 总记录数 */}
                    <span className="small text-muted">共 {total} 条记录</span>
                  </div>
                  
                  {/* 页码导航 */}
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={pagination.currentPage <= 1}
                      onClick={() => {
                        handlePageChange(pagination.currentPage - 1, pagination.pageSize, filters);
                      }}
                    >
                      上一页
                    </Button>
                    
                    {/* 页码显示 */}
                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-muted">第</span>
                      <span className="fw-bold text-primary px-2 py-1 border border-primary rounded">
                        {pagination.currentPage}
                      </span>
                      <span className="small text-muted">页，共 {pagination.totalPages} 页</span>
                    </div>
                    
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() => {
                        handlePageChange(pagination.currentPage + 1, pagination.pageSize, filters);
                      }}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ActivityListContent;