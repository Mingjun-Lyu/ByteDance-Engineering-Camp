import React from 'react';
import { Card, List, Typography } from '@douyinfe/semi-ui';

const Notice = ({ notices }) => {
  if (!notices || notices.length === 0) {
    return null;
  }

  const { Title, Text } = Typography;
  
  return (
    <Card style={{ margin: '20px 0' }}>
      <Title heading={4} style={{ marginBottom: '16px', marginTop: 0 }}>
        公告信息
      </Title>
      <List
        dataSource={notices}
        renderItem={(notice) => (
          <List.Item
            key={notice.id}
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title heading={5} style={{ margin: 0 }}>
                  {notice.title}
                </Title>
                <Text type="tertiary" size="small">
                  {new Date(notice.createTime).toLocaleString()}
                </Text>
              </div>
            }
            main={
              <Text ellipsis={{ rows: 2 }} style={{ width: '100%' }}>
                {notice.content}
              </Text>
            }
            style={{ 
              borderBottom: '1px solid #f0f0f0',
              padding: '12px 0',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fafafa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          />
        )}
      />
    </Card>
  );
};

export default Notice;