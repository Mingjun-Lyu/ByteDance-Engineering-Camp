import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './GuideOverlay.css';

/**
 * 基础引导遮罩组件
 * 提供引导步骤的遮罩显示和交互功能
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
  zIndex = 9999
}) => {
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);

  // 处理键盘事件
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose?.();
          break;
        case 'ArrowRight':
        case 'Enter':
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
  }, [isActive, onNext, onPrevious, onClose]);

  // 处理点击遮罩关闭
  const handleOverlayClick = (event) => {
    if (event.target === overlayRef.current) {
      onClose?.();
    }
  };

  if (!isActive || !step) {
    return null;
  }

  const {
    title,
    content,
    targetElement,
    highlightElement,
    tooltipPosition = position,
    className = ''
  } = step;

  return (
    <div 
      ref={overlayRef}
      className={`guide-overlay ${className}`}
      style={{ zIndex }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      aria-describedby="guide-content"
    >
      {/* 高亮目标元素 */}
      {highlightElement && (
        <div 
          className="guide-highlight"
          data-target-element={targetElement}
        />
      )}
      
      {/* 引导提示框 */}
      <div 
        ref={tooltipRef}
        className={`guide-tooltip guide-tooltip--${tooltipPosition}`}
        role="tooltip"
      >
        {/* 标题和内容 */}
        <div className="guide-tooltip-content">
          {title && (
            <h3 id="guide-title" className="guide-title">
              {title}
            </h3>
          )}
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
            {/* 进度指示器 */}
            {showProgress && step.progress && (
              <div className="guide-progress">
                <span className="guide-progress-text">
                  {step.progress.current} / {step.progress.total}
                </span>
                <div className="guide-progress-bar">
                  <div 
                    className="guide-progress-fill"
                    style={{
                      width: `${(step.progress.current / step.progress.total) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="guide-buttons">
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
    className: PropTypes.string
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
  zIndex: PropTypes.number
};

export default GuideOverlay;