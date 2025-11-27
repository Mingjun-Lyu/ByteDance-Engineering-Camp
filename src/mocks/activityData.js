import Mock from 'mockjs';

// 生成随机活动数据
const generateActivities = () => {
  const categories = ['tech', 'art', 'sports', 'culture', 'education'];
  const categoryLabels = {
    tech: '科技',
    art: '艺术',
    sports: '体育',
    culture: '文化',
    education: '教育'
  };
  
  return Mock.mock({
    'activities|10-20': [{
      'id|+1': 1,
      'title': '@ctitle(5, 10)',
      'description': '@cparagraph(1, 3)',
      'banner': function() {
        const randomNum = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/800/400?random=${randomNum}`;
      },
      'image': function() {
        const randomNum = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/400/300?random=${randomNum + 100}`;
      },
      'category|1': categories,
      'categoryLabel': function() {
        return categoryLabels[this.category];
      },
      'organizer': '@cname() 主办方',
      'location': '@county(true)',
      'startTime': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'endTime': function() {
        const startTime = new Date(this.startTime);
        startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 7) + 1);
        return startTime.toISOString().slice(0, 19).replace('T', ' ');
      },
      'price|0-2000': 0,
      'maxParticipants|20-200': 20,
      'registeredParticipants|0-100': 0,
      'status|1': ['ongoing', 'upcoming', 'ended'],
      'createdAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'updatedAt': '@datetime("yyyy-MM-dd HH:mm:ss")'
    }]
  }).activities;
};

// 生成Banner数据
const generateBanners = () => {
  return Mock.mock({
    'banners|3-5': [{
      'id|+1': 1,
      'image': function() {
        const randomNum = Math.floor(Math.random() * 1000) + 200;
        return `https://picsum.photos/1200/400?random=${randomNum}`;
      },
      'title': '@ctitle(6, 12)',
      'link': function() {
        const activityId = Math.floor(Math.random() * 20) + 1;
        return `/detail/${activityId}`;
      },
      'priority|1-10': 1
    }]
  }).banners;
};

// 生成分类数据
const generateCategories = () => {
  return [
    { value: 'tech', label: '科技', count: Mock.mock('@natural(10, 30)' )},
    { value: 'art', label: '艺术', count: Mock.mock('@natural(8, 25)' )},
    { value: 'sports', label: '体育', count: Mock.mock('@natural(15, 35)' )},
    { value: 'culture', label: '文化', count: Mock.mock('@natural(12, 28)' )},
    { value: 'education', label: '教育', count: Mock.mock('@natural(10, 25)' )}
  ];
};

// 生成公告数据
const generateNotices = () => {
  return Mock.mock({
    'notices|5-10': [{
      'id|+1': 1,
      'title': '@ctitle(8, 20)',
      'content': '@cparagraph(2, 5)',
      'time': function() {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        return date.toLocaleDateString('zh-CN');
      },
      'type|1': ['important', 'normal', 'system'],
      'createdAt': '@datetime("yyyy-MM-dd HH:mm:ss")'
    }]
  }).notices;
};

// 导出模拟数据
export const mockActivities = generateActivities();
export const mockBanners = generateBanners();
export const mockCategories = generateCategories();
export const mockNotices = generateNotices();

// 获取活动详情的模拟函数
export const getActivityById = (id) => {
  return mockActivities.find(activity => activity.id === parseInt(id)) || null;
};

// 按分类获取活动的模拟函数
export const getActivitiesByCategory = (category) => {
  if (category === 'all') {
    return mockActivities;
  }
  return mockActivities.filter(activity => activity.category === category);
};

// 导出所有数据的函数
export const getAllMockData = () => {
  return {
    activities: mockActivities,
    banners: mockBanners,
    categories: mockCategories,
    notices: mockNotices
  };
};

// 导出重点活动数据（用于HighlightActivities组件）
export const mockHighlightActivities = mockActivities
  .filter(activity => activity.status === 'ongoing')
  .sort((a, b) => b.registeredParticipants - a.registeredParticipants)
  .slice(0, 8);