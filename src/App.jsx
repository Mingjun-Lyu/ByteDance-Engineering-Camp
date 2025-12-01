import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './App.css';

// 导入页面组件（后续会重新创建）
import ActivityHome from './pages/ActivityHome';
import ActivityList from './pages/ActivityList';
import ActivityDetail from './pages/ActivityDetail';

// 导入onboarding工具和组件
import { useOnboarding } from './onboarding/hooks/useOnboarding';
import { GuideOverlay } from './onboarding/components';

// 导入引导配置
import { activityPlatformGuideConfig } from './onboarding/guides/activityPlatformGuide';

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
  
  // 使用onboarding hook
  const {
    isActive,
    currentStep,
    isPaused,
    registerGuide,
    startGuide,
    pauseGuide,
    resumeGuide,
    completeStep,
    skipGuide,
    isGuideActive,
    getGuide
  } = useOnboarding({
    debug: true,
    autoSave: true
  });
  
  // 根据当前路径设置激活的导航项（保留注释但移除未使用的函数）
  
  // 注册引导配置
  React.useEffect(() => {
    // 延迟注册，确保引导管理器完全初始化
    const timer = setTimeout(() => {
      console.log('Registering guide:', activityPlatformGuideConfig.id);
      registerGuide(activityPlatformGuideConfig.id, activityPlatformGuideConfig);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [registerGuide]);

  // 处理开始引导按钮点击
  const handleStartGuide = () => {
    if (!isGuideActive('activity-platform-guide')) {
      startGuide('activity-platform-guide');
    }
  };
  
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
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="ms-2 start-guide-btn"
                onClick={handleStartGuide}
                disabled={isActive}
              >
                开始引导
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* 路由内容 */}
      <main className="main-content app-main">
        <Routes location={location}>
          <Route path="/" element={<AnimatedRoute><ActivityHome /></AnimatedRoute>} />
          <Route path="/list" element={<AnimatedRoute><ActivityList /></AnimatedRoute>} />
          <Route path="/detail/:id" element={<AnimatedRoute><ActivityDetail /></AnimatedRoute>} />
        </Routes>
      </main>
      
      {/* 引导UI - 使用onboarding组件 */}
      <GuideOverlay
        isActive={isActive}
        step={currentStep >= 0 ? {
          ...activityPlatformGuideConfig.steps[currentStep],
          progress: {
            current: currentStep + 1,
            total: activityPlatformGuideConfig.steps.length
          },
          isLast: currentStep === activityPlatformGuideConfig.steps.length - 1
        } : null}
        onNext={completeStep}
        onSkip={() => skipGuide('activity-platform-guide')}
        onClose={() => skipGuide('activity-platform-guide')}
        showProgress={true}
        showControls={true}
      />
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
