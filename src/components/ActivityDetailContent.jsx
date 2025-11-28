import React from 'react';
import { 
  Card, 
  Typography, 
  Input, 
  TextArea, 
  Select, 
  DatePicker, 
  Switch, 
  Tag, 
  Space 
} from '@douyinfe/semi-ui';

const { Title, Text } = Typography;

const ActivityDetailContent = ({ 
  activity, 
  isEditing, 
  formData, 
  onFormDataChange 
}) => {
  const handleInputChange = (field, value) => {
    onFormDataChange(field, value);
  };

  // 获取状态文本和颜色（与原始逻辑保持一致）
  const getStatusConfig = (status) => {
    const statusMap = {
      ongoing: { text: '进行中', color: 'green' },
      pending: { text: '待开始', color: 'blue' },
      upcoming: { text: '待开始', color: 'blue' },
      ended: { text: '已结束', color: 'grey' }
    };
    return statusMap[status] || { text: status, color: 'default' };
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
    <Card title="基本信息" style={{ marginBottom: 20 }}>
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right' }}>活动标题</label>
            <Input
              value={formData.title || ''}
              onChange={(value) => handleInputChange('title', value)}
              required
              style={{ width: '400px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right' }}>活动类型</label>
            <Select
              value={formData.category || formData.type}
              onChange={(value) => handleInputChange('category', value)}
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
              onChange={(value) => handleInputChange('startTime', value)}
              showTime
              style={{ width: '400px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right' }}>结束时间</label>
            <DatePicker
              value={formData.endTime}
              onChange={(value) => handleInputChange('endTime', value)}
              showTime
              style={{ width: '400px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right', marginTop: '8px' }}>活动描述</label>
            <TextArea
              value={formData.description || ''}
              onChange={(value) => handleInputChange('description', value)}
              rows={4}
              style={{ width: '400px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right' }}>活动状态</label>
            <Select
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
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
              checked={formData.isPinned || formData.isFeatured || false}
              onChange={(checked) => handleInputChange('isPinned', checked)}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '100px', textAlign: 'right' }}>Banner图片URL</label>
            <Input
              value={formData.banner || ''}
              onChange={(value) => handleInputChange('banner', value)}
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
              {formatDate(activity.startTime)} - {formatDate(activity.endTime)}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>创建人</div>
            <div style={{ fontSize: '16px' }}>{activity.creator || '-'}</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>创建时间</div>
            <div style={{ fontSize: '16px' }}>
              {formatDate(activity.createdAt || activity.createTime)}
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
  );

  const renderActivityRules = () => (
    <Card title="活动规则" style={{ marginBottom: 20 }}>
      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <label style={{ width: '100px', textAlign: 'right', marginTop: '8px' }}>活动规则</label>
          <TextArea
            value={formData.rules || ''}
            onChange={(value) => handleInputChange('rules', value)}
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
  );

  return (
    <div>
      {renderBasicInfo()}
      {renderActivityRules()}
    </div>
  );
};

export default ActivityDetailContent;