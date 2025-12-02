import React from 'react';
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Badge,
  Button
} from 'react-bootstrap';

const ActivityDetailContent = ({ 
  activity, 
  isEditing, 
  formData, 
  onFormDataChange,
  className = '' 
}) => {
  const handleInputChange = (field, value) => {
    onFormDataChange(field, value);
  };

  // 获取状态文本和颜色（与原始逻辑保持一致）
  const getStatusConfig = (status) => {
    const statusMap = {
      ongoing: { text: '进行中', variant: 'success' },
      pending: { text: '待开始', variant: 'primary' },
      upcoming: { text: '待开始', variant: 'primary' },
      ended: { text: '已结束', variant: 'secondary' }
    };
    return statusMap[status] || { text: status, variant: 'secondary' };
  };

  // 格式化日期显示
  const formatDate = (dateString) => {
    if (!dateString) return '时间待定';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const renderBasicInfo = () => (
    <Card className="mb-4 basic-info-card activity-basic-info">
      <Card.Header className="basic-info-header">
        <h5 className="mb-0">基本信息</h5>
      </Card.Header>
      <Card.Body className="basic-info-body">
        {isEditing ? (
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>活动标题</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Col>
              
              <Col md={6}>
                <Form.Label>活动类型</Form.Label>
                <Form.Select
                  value={formData.category || formData.type}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="promotion">促销活动</option>
                  <option value="offline">线下活动</option>
                  <option value="festival">节日活动</option>
                  <option value="exclusive">专属活动</option>
                </Form.Select>
              </Col>
              
              <Col md={6}>
                <Form.Label>开始时间</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('startTime', e.target.value ? new Date(e.target.value) : null)}
                />
              </Col>
              
              <Col md={6}>
                <Form.Label>结束时间</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('endTime', e.target.value ? new Date(e.target.value) : null)}
                />
              </Col>
              
              <Col md={6}>
                <Form.Label>活动状态</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="ongoing">进行中</option>
                  <option value="pending">待开始</option>
                  <option value="upcoming">待开始</option>
                  <option value="ended">已结束</option>
                </Form.Select>
              </Col>
              
              <Col md={6}>
                <Form.Label>是否置顶</Form.Label>
                <Form.Check
                  type="switch"
                  checked={formData.isPinned || formData.isFeatured || false}
                  onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                  label={formData.isPinned || formData.isFeatured ? '是' : '否'}
                />
              </Col>
              
              <Col md={12}>
                <Form.Label>活动描述</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Col>
              
              <Col md={12}>
                <Form.Label>Banner图片URL</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.banner || ''}
                  onChange={(e) => handleInputChange('banner', e.target.value)}
                />
              </Col>
            </Row>
          </Form>
        ) : (
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted">活动标题</small>
                <div className="fw-bold">{activity.title}</div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted">活动类型</small>
                <div>{activity.category || activity.type}</div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted">活动状态</small>
                <div>
                  {(() => {
                    const { text, variant } = getStatusConfig(activity.status);
                    return <Badge bg={variant}>{text}</Badge>;
                  })()}
                </div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted">活动时间</small>
                <div>
                  {formatDate(activity.startTime)} - {formatDate(activity.endTime)}
                </div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted">创建人</small>
                <div>{activity.creator || '-'}</div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted">创建时间</small>
                <div>
                  {formatDate(activity.createdAt || activity.createTime)}
                </div>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted">是否置顶</small>
                <div>{(activity.isPinned || activity.isFeatured) ? '是' : '否'}</div>
              </div>
            </Col>
            
            <Col md={12}>
              <div className="mb-3">
                <small className="text-muted">活动描述</small>
                <div className="white-space-pre-line">{activity.description || '暂无描述'}</div>
              </div>
            </Col>
            
            <Col md={12}>
              <div className="mb-3">
                <small className="text-muted">Banner图片</small>
                <div className="activity-banner">
                  {activity.banner ? (
                    <img 
                      src={activity.banner} 
                      alt={activity.title} 
                      className="img-fluid"
                      style={{ maxWidth: '400px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <span>暂无图片</span>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );

  const renderActivityRules = () => (
    <Card className="mb-4 activity-rules-card">
      <Card.Header className="activity-rules-header">
        <h5 className="mb-0">活动规则</h5>
      </Card.Header>
      <Card.Body className="activity-rules-body">
        {isEditing ? (
          <Form>
            <Row>
              <Col md={12}>
                <Form.Label>活动规则</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={formData.rules || ''}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                />
              </Col>
            </Row>
          </Form>
        ) : (
          <div className="white-space-pre-line">
            {activity.rules ? (
              activity.rules.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>暂无规则</p>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div className={`activity-detail-content-wrapper ${className}`}>
      {renderBasicInfo()}
      {renderActivityRules()}
    </div>
  );
};

export default ActivityDetailContent;