import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
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
  
  // 根据当前路径设置激活的导航项（保留注释但移除未使用的函数）
  
  return (
    <div className="app-container">
      {/* 导航栏 - 使用React Bootstrap */}
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4">
            活动管理平台
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={location.pathname === '/' ? 'active fw-bold' : ''}
              >
                首页
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/list" 
                className={location.pathname.startsWith('/list') ? 'active fw-bold' : ''}
              >
                活动列表
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* 路由内容 */}
      <main className="main-content">
        <Container fluid className="py-4">
          <Routes location={location}>
            <Route path="/" element={<AnimatedRoute><ActivityHome /></AnimatedRoute>} />
            <Route path="/list" element={<AnimatedRoute><ActivityList /></AnimatedRoute>} />
            <Route path="/detail/:id" element={<AnimatedRoute><ActivityDetail /></AnimatedRoute>} />
          </Routes>
        </Container>
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
