import React from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';

// 筛选表单组件
const FilterForm = ({ tempFilters, updateTempFilter, handleFilterSubmit, handleReset, pagination, togglePagination, filters }) => {

  return (
    <Card className="filter-card">
      <Card.Body>
        <Form>
          <Row className="g-3 align-items-end">
            <Col md={2}>
              <Form.Label>活动分类</Form.Label>
              <Form.Select
                value={tempFilters.category}
                onChange={(e) => updateTempFilter('category', e.target.value)}
              >
                <option value="">全部分类</option>
                <option value="promotion">促销活动</option>
                <option value="offline">线下活动</option>
                <option value="festival">节日活动</option>
                <option value="exclusive">专属活动</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <Form.Label>活动状态</Form.Label>
              <Form.Select
                value={tempFilters.status}
                onChange={(e) => updateTempFilter('status', e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="ongoing">进行中</option>
                <option value="upcoming">待开始</option>
                <option value="ended">已结束</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <Form.Label>关键词</Form.Label>
              <Form.Control
                type="text"
                placeholder="搜索活动标题或描述"
                value={tempFilters.keyword}
                onChange={(e) => updateTempFilter('keyword', e.target.value)}
              />
            </Col>
            
            <Col md={2}>
              <Form.Label>开始时间</Form.Label>
              <Form.Control
                type="date"
                value={tempFilters.startTime ? new Date(tempFilters.startTime).toISOString().split('T')[0] : ''}
                onChange={(e) => updateTempFilter('startTime', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </Col>
            
            <Col md={2}>
              <Form.Label>结束时间</Form.Label>
              <Form.Control
                type="date"
                value={tempFilters.endTime ? new Date(tempFilters.endTime).toISOString().split('T')[0] : ''}
                onChange={(e) => updateTempFilter('endTime', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </Col>
            
            <Col md={2}>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleFilterSubmit}>
                  筛选
                </Button>
                <Button variant="outline-secondary" onClick={handleReset}>
                  重置
                </Button>
                <Button 
                  variant={pagination.disablePagination ? "primary" : "outline-primary"}
                  onClick={() => togglePagination(!pagination.disablePagination, filters)}
                >
                  {pagination.disablePagination ? "恢复分页" : "取消分页"}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FilterForm;