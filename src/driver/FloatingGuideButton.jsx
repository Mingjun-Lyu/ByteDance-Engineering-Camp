import React, { useEffect } from 'react';
import { useFloatingGuide } from './useFloatingGuide';
import './FloatingGuideButton.css';

/**
 * 悬浮引导按钮组件
 * 位置：顶部居中
 * 功能：启动用户引导程序
 */
const FloatingGuideButton = ({ 
  buttonText = "开始引导",
  showProgress = true 
}) => {
  // 使用悬浮引导Hook管理所有引导逻辑
  const {
    isVisible,
    isLoading,
    guideProgress,
    startGuide,
    hideGuide
  } = useFloatingGuide({
    autoShow: true,
    defaultVisible: true,
    onGuideStart: () => {
      console.log('引导开始');
    },
    onGuideComplete: () => {
      console.log('引导完成');
    },
    onGuideSkip: () => {
      console.log('引导跳过');
    }
  });

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl + G 快捷键启动引导
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        startGuide();
      }
      
      // ESC 键隐藏按钮
      if (event.key === 'Escape') {
        hideGuide();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [startGuide, hideGuide]);

  // 如果按钮被隐藏，不渲染
  if (!isVisible) {
    return null;
  }

  return (
    <div className="floating-guide-container">
      <div className="floating-guide-button-wrapper">
        <button
          className={`floating-guide-button ${isLoading ? 'loading' : ''}`}
          onClick={startGuide}
          disabled={isLoading}
          aria-label="开始用户引导程序"
        >
          {isLoading ? (
            <div className="button-loading">
              <div className="loading-spinner"></div>
              <span>加载中...</span>
            </div>
          ) : (
            <div className="button-content">
              <svg 
                className="guide-icon" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span className="button-text">{buttonText}</span>
            </div>
          )}
        </button>
        
        {showProgress && guideProgress > 0 && (
          <div className="guide-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${guideProgress}%` }}></div>
            </div>
            <span className="progress-text">{Math.round(guideProgress)}%</span>
          </div>
        )}
        
        <button 
          className="close-button"
          onClick={hideGuide}
          aria-label="隐藏引导按钮"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FloatingGuideButton;