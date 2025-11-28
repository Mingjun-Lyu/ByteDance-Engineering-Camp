import Mock from 'mockjs';

// 生成随机活动数据
const generateActivities = () => {
  const categories = ['promotion', 'offline', 'festival', 'exclusive'];
  const categoryLabels = {
    promotion: '促销活动',
    offline: '线下活动',
    festival: '节日活动',
    exclusive: '专属活动'
  };
  
  const activities = [];
  let id = 1;
  
  // 为每个分类生成50个活动
  categories.forEach(category => {
    for (let i = 1; i <= 50; i++) {
      // 生成2025年的随机日期和时间
      const year = 2025;
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      const seconds = Math.floor(Math.random() * 60);
      
      const startTime = new Date(year, month - 1, day, hours, minutes, seconds);
      const endTime = new Date(startTime);
      endTime.setDate(endTime.getDate() + Math.floor(Math.random() * 7) + 1);
      
      // 格式化时间字符串
      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${min}:${s}`;
      };
      
      activities.push({
        id: id++,
        title: `${categoryLabels[category]}${i}`,
        description: Mock.mock('@cparagraph(1, 3)'),
        banner: `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`,
        image: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000) + 100}`,
        category: category,
        categoryLabel: categoryLabels[category].replace('活动', ''),
        organizer: Mock.mock('@cname() 主办方'),
        location: Mock.mock('@county(true)'),
        startTime: formatDate(startTime),
        endTime: formatDate(endTime),
        price: Mock.mock('@natural(0, 2000)'),
        maxParticipants: Mock.mock('@natural(20, 200)'),
        registeredParticipants: Mock.mock('@natural(0, 100)'),
        status: Mock.mock('@pick(["ongoing", "upcoming", "ended"])'),
        createdAt: formatDate(new Date(year, month - 1, Math.max(1, day - 10), hours, minutes, seconds)),
        updatedAt: formatDate(new Date(year, month - 1, Math.max(1, day - 5), hours, minutes, seconds))
      });
    }
  });
  
  // 随机排序活动数据
  return activities.sort(() => Math.random() - 0.5);
};

// 从活动数据中生成Banner数据
const generateBanners = (activities = mockActivities) => {
  // 优先选择进行中和即将开始的活动，按创建时间倒序排列
  const eligibleActivities = activities
    .filter(activity => activity.status === 'ongoing' || activity.status === 'upcoming')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 如果符合条件的活动不足，从所有活动中随机选择
  const selectedActivities = eligibleActivities.slice(0, 4);
  
  if (selectedActivities.length < 4) {
    // 如果符合条件的活动不足，从所有活动中补充随机选择
    const remainingCount = 4 - selectedActivities.length;
    const allActivitiesShuffled = [...activities].sort(() => 0.5 - Math.random());
    const additionalActivities = allActivitiesShuffled.filter(activity => 
      !selectedActivities.find(a => a.id === activity.id)
    ).slice(0, remainingCount);
    
    selectedActivities.push(...additionalActivities);
  }
  
  // 将活动数据转换为Banner格式
  return selectedActivities.map((activity, index) => ({
    id: activity.id,
    image: activity.image || Mock.mock('@image(1200x400)'),
    title: activity.title,
    link: `/detail/${activity.id}`,
    priority: 10 - index // 添加优先级
  }));
};

// 从活动数据中生成分类Banner数据（保留注释但移除未使用的函数）

// 生成分类数据
const generateCategories = () => {
  return [
    { value: 'promotion', label: '促销', count: 50 },
    { value: 'offline', label: '线下', count: 50 },
    { value: 'festival', label: '节日', count: 50 },
    { value: 'exclusive', label: '专属', count: 50 }
  ];
};

// 从活动数据中生成公告数据
const generateNotices = (activities) => {
  // 根据活动生成相关公告
  const activityRelatedNotices = [];
  
  // 为即将开始的活动生成公告
  const upcomingActivities = activities.filter(activity => activity.status === 'upcoming');
  upcomingActivities.forEach(activity => {
    activityRelatedNotices.push({
      id: activity.id * 10 + 1,
      title: `活动预告：${activity.title}即将开始`,
      content: `各位用户好，我们将于${new Date(activity.startTime).toLocaleDateString()}举办"${activity.title}"活动，${activity.description}。活动地点：${activity.location}。欢迎大家踊跃参与！`,
      createdAt: new Date(new Date(activity.startTime) - 7 * 24 * 60 * 60 * 1000).toISOString(), // 提前7天发布
      type: 'activity'
    });
  });
  
  // 为进行中的热门活动生成公告
  const ongoingActivities = activities.filter(activity => activity.status === 'ongoing');
  ongoingActivities.slice(0, 3).forEach(activity => {
    activityRelatedNotices.push({
      id: activity.id * 10 + 2,
      title: `活动提醒：${activity.title}正在进行中`,
      content: `热门活动"${activity.title}"正在火热进行中！${activity.description}。活动将持续到${new Date(activity.endTime).toLocaleDateString()}，抓紧时间参与吧！`,
      createdAt: new Date(new Date(activity.startTime) + 24 * 60 * 60 * 1000).toISOString(), // 活动开始后1天发布
      type: 'activity'
    });
  });
  
  // 添加一些系统公告（保证至少有2条系统公告）
  const systemNotices = [
    {
      id: 1001,
      title: '系统维护通知',
      content: '为了提供更好的服务体验，系统将于每周日凌晨2点至4点进行例行维护。维护期间可能出现短暂的服务中断，请提前做好准备。',
      createdAt: new Date().toISOString(),
      type: 'maintenance'
    },
    {
      id: 1002,
      title: '数据安全升级公告',
      content: '我们已完成数据安全系统的全面升级，加强了用户信息保护和数据加密机制。感谢您一直以来对我们的信任与支持！',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天前
      type: 'system'
    }
  ];
  
  // 合并公告并按时间倒序排序
  const allNotices = [...activityRelatedNotices, ...systemNotices];
  allNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 限制公告数量在5-10条
  const noticeCount = Math.min(allNotices.length, Math.floor(Math.random() * 6) + 5);
  return allNotices.slice(0, noticeCount);
};

// 导出模拟数据
export const mockActivities = generateActivities();
export const mockBanners = generateBanners(mockActivities);
export const mockCategories = generateCategories();
export const mockNotices = generateNotices(mockActivities);

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

// 从活动数据中生成重点活动数据
export const generateHighlightActivities = (activities) => {
  // 第一优先级：进行中且参与人数多的活动
  const ongoingPopular = activities
    .filter(activity => activity.status === 'ongoing')
    .sort((a, b) => b.registeredParticipants - a.registeredParticipants)
    .slice(0, 8);
  
  // 第二优先级：即将开始的热门活动
  const upcomingActivities = activities
    .filter(activity => activity.status === 'upcoming')
    .sort((a, b) => b.registeredParticipants - a.registeredParticipants)
    .slice(0, 4);
  
  // 合并重点活动并确保数据结构完整
  const highlightActivities = [...ongoingPopular, ...upcomingActivities].map(activity => ({
    ...activity,
    // 确保图片URL存在
    imageUrl: activity.image || `https://picsum.photos/400/300?random=${activity.id}`,
    // 确保描述存在
    description: activity.description || '这是一个精彩的活动，欢迎参加！',
    // 添加重点活动特有的标记
    isHighlight: true,
    // 计算热度分数
    popularityScore: Math.floor(activity.registeredParticipants * 0.7 + Math.random() * 30)
  }));
  
  // 按热度分数排序
  highlightActivities.sort((a, b) => b.popularityScore - a.popularityScore);
  
  return highlightActivities.slice(0, 12); // 限制最多12个重点活动
};

// 导出重点活动数据（用于HighlightActivities组件）
export const mockHighlightActivities = generateHighlightActivities(mockActivities);