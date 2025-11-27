import React from 'react';
import { List, Card } from '@douyinfe/semi-ui';
import './Notice.css';

const Notice = () => {
  // 使用静态公告数据
  const notices = [
    {
      id: 1,
      title: '系统维护通知',
      content: '将于2024年1月15日凌晨2点-4点进行系统维护，请提前做好准备。',
      date: '2024-01-10'
    },
    {
      id: 2,
      title: '新功能上线公告',
      content: '活动管理系统新增数据统计功能，欢迎体验！',
      date: '2024-01-08'
    },
    {
      id: 3,
      title: '节假日安排通知',
      content: '春节期间（2月10日-2月17日）系统将正常运行，但客服响应可能略有延迟。',
      date: '2024-01-05'
    }
  ];

  return (
    <Card className="notice-card">
      <h3 className="notice-title">公告信息</h3>
      <List
        className="notice-list"
        dataSource={notices}
        renderItem={notice => (
          <List.Item className="notice-item">
            <div className="notice-item-content">
              <div className="notice-item-header">
                <span className="notice-item-title">{notice.title}</span>
                <span className="notice-item-date">{notice.date}</span>
              </div>
              <div className="notice-item-body">
                <p>{notice.content}</p>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Notice;