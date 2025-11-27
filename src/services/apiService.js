import axios from 'axios';
import { mockActivities, mockBanners, mockCategories, mockHighlightActivities } from '../mocks/activityData';

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 模拟请求延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API服务类
class ActivityApiService {
  // 获取轮播图数据
  async getBanners() {
    try {
      // 在真实环境中，这里应该调用实际的API
      // const response = await apiClient.get('/banners');
      // return response;
      
      // 模拟API调用
      await delay(300);
      return mockBanners;
    } catch (error) {
      console.error('获取轮播图失败:', error);
      throw error;
    }
  }

  // 获取活动分类
  async getActivityCategories() {
    try {
      // const response = await apiClient.get('/categories');
      await delay(200);
      return mockCategories;
    } catch (error) {
      console.error('获取活动分类失败:', error);
      throw error;
    }
  }

  // 获取活动列表
  async getActivityList(params = {}) {
    try {
      // const response = await apiClient.get('/activities', { params });
      await delay(500);
      
      let filteredActivities = [...mockActivities];
      
      // 应用筛选条件
      if (params.status) {
        filteredActivities = filteredActivities.filter(activity => activity.status === params.status);
      }
      
      if (params.category) {
        filteredActivities = filteredActivities.filter(activity => activity.category === params.category);
      }
      
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredActivities = filteredActivities.filter(activity => 
          activity.title.toLowerCase().includes(keyword) ||
          activity.description.toLowerCase().includes(keyword)
        );
      }
      
      if (params.startDate) {
        const startDate = new Date(params.startDate);
        filteredActivities = filteredActivities.filter(activity => 
          new Date(activity.startTime) >= startDate
        );
      }
      
      if (params.endDate) {
        const endDate = new Date(params.endDate);
        filteredActivities = filteredActivities.filter(activity => 
          new Date(activity.endTime) <= endDate
        );
      }
      
      // 排序
      if (params.sortBy === 'time') {
        filteredActivities.sort((a, b) => 
          params.sortOrder === 'desc' 
            ? new Date(b.startTime) - new Date(a.startTime)
            : new Date(a.startTime) - new Date(b.startTime)
        );
      } else if (params.sortBy === 'participants') {
        filteredActivities.sort((a, b) => 
          params.sortOrder === 'desc'
            ? b.registeredParticipants - a.registeredParticipants
            : a.registeredParticipants - b.registeredParticipants
        );
      }
      
      // 分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const total = filteredActivities.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedActivities = filteredActivities.slice(start, end);
      
      return {
        list: paginatedActivities,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('获取活动列表失败:', error);
      throw error;
    }
  }

  // 获取重点活动
  async getHighlightActivities() {
    try {
      // const response = await apiClient.get('/activities/highlight');
      await delay(400);
      // 直接从mockActivities中筛选，确保使用最新数据
      return mockActivities
        .filter(activity => activity.status === 'ongoing')
        .sort((a, b) => b.registeredParticipants - a.registeredParticipants)
        .slice(0, 8);
    } catch (error) {
      console.error('获取重点活动失败:', error);
      throw error;
    }
  }

  // 获取活动详情
  async getActivityDetail(id) {
    try {
      // const response = await apiClient.get(`/activities/${id}`);
      await delay(300);
      const activity = mockActivities.find(activity => activity.id === Number(id));
      if (!activity) {
        throw new Error('活动不存在');
      }
      return activity;
    } catch (error) {
      console.error(`获取活动详情失败 (ID: ${id}):`, error);
      throw error;
    }
  }

  // 更新活动详情
  async updateActivityDetail(id, data) {
    try {
      // const response = await apiClient.put(`/activities/${id}`, data);
      await delay(600);
      const activityIndex = mockActivities.findIndex(activity => activity.id === Number(id));
      if (activityIndex === -1) {
        throw new Error('活动不存在');
      }
      
      const updatedActivity = {
        ...mockActivities[activityIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // 在真实环境中，这里只是模拟更新，实际数据应该由后端返回
      mockActivities[activityIndex] = updatedActivity;
      return updatedActivity;
    } catch (error) {
      console.error(`更新活动详情失败 (ID: ${id}):`, error);
      throw error;
    }
  }

  // 创建新活动
  async createActivity(data) {
    try {
      // const response = await apiClient.post('/activities', data);
      await delay(700);
      const newActivity = {
        ...data,
        id: mockActivities.length + 1,
        participantCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockActivities.push(newActivity);
      return newActivity;
    } catch (error) {
      console.error('创建活动失败:', error);
      throw error;
    }
  }

  // 删除活动
  async deleteActivity(id) {
    try {
      // const response = await apiClient.delete(`/activities/${id}`);
      await delay(400);
      const activityIndex = mockActivities.findIndex(activity => activity.id === Number(id));
      if (activityIndex === -1) {
        throw new Error('活动不存在');
      }
      
      mockActivities.splice(activityIndex, 1);
      return { success: true };
    } catch (error) {
      console.error(`删除活动失败 (ID: ${id}):`, error);
      throw error;
    }
  }

  // 参与活动
  async joinActivity(id) {
    try {
      // const response = await apiClient.post(`/activities/${id}/join`);
      await delay(500);
      const activityIndex = mockActivities.findIndex(activity => activity.id === Number(id));
      if (activityIndex === -1) {
        throw new Error('活动不存在');
      }
      
      const activity = mockActivities[activityIndex];
      if (activity.participantCount >= activity.maxParticipants) {
        throw new Error('活动人数已满');
      }
      
      if (activity.status !== 'ongoing') {
        throw new Error('活动已结束或未开始');
      }
      
      activity.participantCount += 1;
      activity.updatedAt = new Date().toISOString();
      
      return { success: true, participantCount: activity.participantCount };
    } catch (error) {
      console.error(`参与活动失败 (ID: ${id}):`, error);
      throw error;
    }
  }
}

// 导出单例实例
export const activityApiService = new ActivityApiService();
export default activityApiService;