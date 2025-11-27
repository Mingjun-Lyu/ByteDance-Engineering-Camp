import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Nav } from '@douyinfe/semi-ui';
import './App.css';

// 导入页面组件（后续会重新创建）
import ActivityHome from './pages/ActivityHome';
import ActivityList from './pages/ActivityList';
import ActivityDetail from './pages/ActivityDetail';

// 为所有页面组件添加过渡效果
const AnimatedRoute = ({ children }) => {
  return (
    <div className="route-transition">
      {children}
    </div>
  );
};

// 将路由逻辑封装到Router内部的组件中
const AppContent = () => {
  const location = useLocation();
  
  // 根据当前路径设置激活的导航项
  const getActiveItemKey = () => {
    const pathname = location.pathname;
    if (pathname === '/') return ['home'];
    if (pathname.startsWith('/list')) return ['list'];
    return [];
  };
  
  return (
    <div className="app-container">
      {/* 导航栏 */}
      <Nav 
        mode="horizontal" 
        theme="light" 
        style={{ backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Nav.Item itemKey="logo" style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
          <Link to="/">活动管理平台</Link>
        </Nav.Item>
        <Nav.Item 
          itemKey="home"
          className={location.pathname === '/' ? 'nav-item-active' : ''}
        >
          <Link to="/">首页</Link>
        </Nav.Item>
        <Nav.Item 
          itemKey="list"
          className={location.pathname.startsWith('/list') ? 'nav-item-active' : ''}
        >
          <Link to="/list">活动列表</Link>
        </Nav.Item>
      </Nav>
      
      {/* 路由内容 */}
      <main className="main-content">
        <Routes location={location}>
          <Route path="/" element={<AnimatedRoute><ActivityHome /></AnimatedRoute>} />
          <Route path="/list" element={<AnimatedRoute><ActivityList /></AnimatedRoute>} />
          <Route path="/detail/:id" element={<AnimatedRoute><ActivityDetail /></AnimatedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
