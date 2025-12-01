import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './App.css';

// 导入页面组件
import ActivityHome from './pages/ActivityHome';
import ActivityList from './pages/ActivityList';
import ActivityDetail from './pages/ActivityDetail';

// 导入新手引导组件
import { GuideManager } from './intro';

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
  
  return (
    <div className="app-container">
      {/* 导航栏 - 使用React Bootstrap */}
      <Navbar bg="light" expand="lg" className="shadow-sm app-navbar">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4 app-brand">
            活动管理平台
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle" />
          <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse">
            <Nav className="ms-auto navbar-nav">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`}
              >
                首页
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/list" 
                className={`nav-link ${location.pathname.startsWith('/list') ? 'active fw-bold' : ''}`}
              >
                活动列表
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* 新手引导组件 */}
      <GuideManager />
      
      {/* 路由内容 */}
      <main className="main-content app-main">
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