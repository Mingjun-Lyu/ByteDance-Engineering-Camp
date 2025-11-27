import { mockBanners, mockCategories, mockNotices, mockHighlightActivities, mockActivities } from './activityData';

// 模拟API请求延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取Banner列表
export const getBanners = async () => {
  await delay(300);
  return {
    success: true,
    data: mockBanners
  };
};

// 获取活动分类
export const getActivityCategories = async () => {
  await delay(200);
  return {
    success: true,
    data: mockCategories
  };
};

// 获取公告列表
export const getNotices = async () => {
  await delay(200);
  return {
    success: true,
    data: mockNotices
  };
};

// 获取进行中的重点活动
export const getOngoingHighlightActivities = async () => {
  await delay(400);
  return {
    success: true,
    data: mockHighlightActivities
  };
};

// 获取分类顶部轮播banner数据（使用即将开始的活动）
export const getCategoryTopBanners = async () => {
  await delay(300);
  // 筛选即将开始的活动，按创建时间倒序排列，取前4个作为轮播图
  const upcomingActivities = mockActivities
    .filter(activity => activity.status === 'upcoming')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);
  
  return {
    success: true,
    data: upcomingActivities
  };
};
