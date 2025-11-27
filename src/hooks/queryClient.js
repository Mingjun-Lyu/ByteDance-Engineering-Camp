import { QueryClient } from '@tanstack/react-query';

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存时间（默认5分钟）
      staleTime: 5 * 60 * 1000,
      // 数据保留时间（默认1小时）
      gcTime: 60 * 60 * 1000,
      // 重试次数
      retry: 1,
      // 重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 窗口焦点重新获取数据
      refetchOnWindowFocus: true,
      // 网络重新连接时获取数据
      refetchOnReconnect: 'always',
      // 背景刷新间隔
      refetchInterval: false,
      // 启用窗口隐藏时的后台获取
      refetchOnMount: true,
      // 错误处理
      onError: (error) => {
        console.error('Query error:', error);
        // 这里可以集成全局错误处理
      },
      // 成功处理
      onSuccess: (data) => {
        console.log('Query success:', data);
      },
      // 数据转换
      select: (data) => data
    },
    mutations: {
      // 提交重试次数
      retry: 1,
      // 提交重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 错误处理
      onError: (error) => {
        console.error('Mutation error:', error);
      },
      // 成功处理
      onSuccess: (data) => {
        console.log('Mutation success:', data);
      }
    }
  }
});

export default queryClient;