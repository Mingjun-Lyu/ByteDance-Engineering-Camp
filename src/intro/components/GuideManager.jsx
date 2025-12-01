import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GuidePanel from './GuidePanel';

// 直接导入JSON配置文件
import homeGuideConfig from '../jsons/home-guide-config.json';

const GuideManager = ({ 
  children, 

  position = 'top-center',

  onGuideStart,
  onGuideComplete
}) => {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [guideConfig, setGuideConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  const location = useLocation();

  // 加载引导配置
  useEffect(() => {
    // 根据当前页面路径选择对应的配置
    const getConfig = () => {
      // 始终返回首页配置，无论当前页面是什么
      return homeGuideConfig;
    };

    const loadConfig = () => {
      try {
        const config = getConfig();
        // 检查配置是否有效
        if (!config || !config.title || !config.steps) {
          throw new Error('引导配置文件格式错误或缺失必要字段');
        }
        setGuideConfig(config);
        setConfigError(null);
      } catch (error) {
        console.warn('Failed to load guide config:', error);
        setConfigError(error.message);
        // 不再使用默认配置，直接设置为null
        setGuideConfig(null);
      }
    };

    loadConfig();
  }, [location.pathname]);

  const handleGuideStart = () => {
    // 检查配置是否有效
    if (configError || !guideConfig || guideConfig.steps.length === 0) {
      alert('引导配置文件缺失或格式错误，无法开始引导！\n\n错误信息：' + (configError || '配置文件为空或缺少步骤配置'));
      return;
    }
    
    setIsGuideActive(true);
    if (onGuideStart) {
      onGuideStart();
    }
  };

  const handleGuideComplete = () => {
    setIsGuideActive(false);
    if (onGuideComplete) {
      onGuideComplete();
    }
  };



  // 如果配置加载失败，不显示引导面板
  if (!guideConfig) {
    return children;
  }

  return (
    <>
      {children}
      
      {/* 引导面板 - 始终显示，不自动隐藏 */}
      <GuidePanel
        position={position}
        showOnStart={true} // 始终显示
        onGuideStart={handleGuideStart}
        onGuideComplete={handleGuideComplete}
        guideConfig={guideConfig}
      />
      
      {/* 引导遮罩层（如果引导正在进行） */}
      {isGuideActive && (
        <div className="guide-overlay" />
      )}
    </>
  );
};

// 添加全局样式
const guideOverlayStyle = `
  .guide-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.1);
    z-index: 9998;
    pointer-events: none;
  }
`;

// 注入样式到文档头部
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = guideOverlayStyle;
  document.head.appendChild(styleElement);
}

export default GuideManager;