import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './GuideOverlay.css';

/**
 * 基于DriverJS设计理念的现代化引导遮罩组件
 * 提供更优雅的动画效果和用户体验
 */
const GuideOverlay = ({
  step,
  isActive = false,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  position = 'bottom',
  showControls = true,
  showProgress = true,
  zIndex = 9999,
  animationDuration = 300,
  allowCloseOnOverlayClick = true,
  allowKeyboardNavigation = true
}) => {
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState({});

  // 更新高亮元素位置
  const updateHighlightPosition = useCallback(() => {
    if (!step?.targetElement) return;
    
    const target = document.querySelector(step.targetElement);
    if (target) {
      const rect = target.getBoundingClientRect();
      setHighlightStyle({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  }, [step]);

  // 动画显示/隐藏控制
  useEffect(() => {
    if (isActive && step) {
      // 使用requestAnimationFrame避免同步状态更新
      requestAnimationFrame(() => {
        setIsVisible(true);
        updateHighlightPosition();
      });
    } else {
      requestAnimationFrame(() => {
        setIsVisible(false);
      });
    }
  }, [isActive, step, updateHighlightPosition]);

  // 处理键盘事件
  useEffect(() => {
    if (!isActive || !allowKeyboardNavigation) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose?.();
          break;
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          event.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious?.();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onNext, onPrevious, onClose, allowKeyboardNavigation]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      updateHighlightPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [step?.targetElement, updateHighlightPosition]);

  // 处理点击遮罩关闭
  const handleOverlayClick = (event) => {
    if (allowCloseOnOverlayClick && event.target === overlayRef.current) {
      onClose?.();
    }
  };

  // 计算最佳提示框位置
  const calculateTooltipPosition = () => {
    if (!step?.targetElement) return position;
    
    const target = document.querySelector(step.targetElement);
    if (!target) return position;
    
    const rect = target.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // 根据目标元素位置自动选择最佳位置
    if (rect.top > viewportHeight / 2) {
      return 'top';
    } else if (rect.bottom < viewportHeight / 2) {
      return 'bottom';
    } else if (rect.left > viewportWidth / 2) {
      return 'left';
    } else {
      return 'right';
    }
  };

  if (!isActive || !step || !isVisible) {
    return null;
  }

  const {
    title,
    content,
    targetElement,
    highlightElement = true,
    tooltipPosition = calculateTooltipPosition(),
    className = '',
    customButtons
  } = step;

  return (
    <div 
      ref={overlayRef}
      className={`guide-overlay ${className}`}
      style={{ 
        zIndex,
        animationDuration: `${animationDuration}ms`
      }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      aria-describedby="guide-content"
    >
      {/* 高亮目标元素 - 基于DriverJS的现代化高亮效果 */}
      {highlightElement && targetElement && (
        <div 
          className="guide-highlight"
          data-target-element={targetElement}
          style={highlightStyle}
        />
      )}
      
      {/* 引导提示框 - 现代化设计 */}
      <div 
        ref={tooltipRef}
        className={`guide-tooltip guide-tooltip--${tooltipPosition}`}
        role="tooltip"
        style={{ animationDuration: `${animationDuration}ms` }}
      >
        {/* 标题和内容区域 */}
        <div className="guide-tooltip-content">
          {/* 标题区域 */}
          {title && (
            <div className="guide-header">
              <h3 id="guide-title" className="guide-title">
                {title}
              </h3>
              {/* 关闭按钮 */}
              <button
                type="button"
                className="guide-close-button"
                onClick={onClose}
                aria-label="关闭引导"
              >
                ×
              </button>
            </div>
          )}
          
          {/* 内容区域 */}
          {content && (
            <div id="guide-content" className="guide-content">
              {typeof content === 'string' ? (
                <p>{content}</p>
              ) : (
                content
              )}
            </div>
          )}
        </div>

        {/* 控制面板 */}
        {showControls && (
          <div className="guide-controls">
            {/* 进度指示器 - 更直观的设计 */}
            {showProgress && step.progress && (
              <div className="guide-progress">
                <div className="guide-progress-bar">
                  <div 
                    className="guide-progress-fill"
                    style={{
                      width: `${(step.progress.current / step.progress.total) * 100}%`
                    }}
                  />
                </div>
                <span className="guide-progress-text">
                  {step.progress.current} / {step.progress.total}
                </span>
              </div>
            )}

            {/* 操作按钮区域 */}
            <div className="guide-buttons">
              {/* 自定义按钮 */}
              {customButtons}
              
              {/* 标准按钮 */}
              <div className="guide-standard-buttons">
                {onSkip && (
                  <button
                    type="button"
                    className="guide-button guide-button--text"
                    onClick={onSkip}
                    aria-label="跳过引导"
                  >
                    跳过
                  </button>
                )}
                
                {onPrevious && (
                  <button
                    type="button"
                    className="guide-button guide-button--secondary"
                    onClick={onPrevious}
                    aria-label="上一步"
                  >
                    上一步
                  </button>
                )}
                
                <button
                  type="button"
                  className="guide-button guide-button--primary"
                  onClick={onNext}
                  aria-label={step.isLast ? "完成引导" : "下一步"}
                >
                  {step.isLast ? '完成' : '下一步'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

GuideOverlay.propTypes = {
  /** 当前引导步骤配置 */
  step: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    targetElement: PropTypes.string,
    highlightElement: PropTypes.bool,
    tooltipPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'auto']),
    progress: PropTypes.shape({
      current: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired
    }),
    isLast: PropTypes.bool,
    className: PropTypes.string,
    customButtons: PropTypes.node
  }),
  /** 是否激活显示 */
  isActive: PropTypes.bool,
  /** 下一步回调 */
  onNext: PropTypes.func,
  /** 上一步回调 */
  onPrevious: PropTypes.func,
  /** 跳过引导回调 */
  onSkip: PropTypes.func,
  /** 关闭引导回调 */
  onClose: PropTypes.func,
  /** 提示框位置 */
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'auto']),
  /** 是否显示控制面板 */
  showControls: PropTypes.bool,
  /** 是否显示进度 */
  showProgress: PropTypes.bool,
  /** z-index 层级 */
  zIndex: PropTypes.number,
  /** 动画持续时间（毫秒） */
  animationDuration: PropTypes.number,
  /** 是否允许点击遮罩关闭 */
  allowCloseOnOverlayClick: PropTypes.bool,
  /** 是否允许键盘导航 */
  allowKeyboardNavigation: PropTypes.bool
};

export default GuideOverlay;