import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './GuideTooltip.css';

/**
 * 步骤提示框组件
 * 在目标元素旁边显示引导提示，不包含遮罩
 */
const GuideTooltip = ({
  step,
  isActive = false,
  onNext,
  onPrevious,
  onClose,
  position = 'bottom',
  showArrow = true,
  offset = 10,
  zIndex = 9998,
  className = ''
}) => {
  const tooltipRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const [currentPositionString, setCurrentPositionString] = useState('bottom');

  // 获取不同方向的定位
  const getPositionForDirection = (direction, targetRect, tooltipRect, offset) => {
    switch (direction) {
      case 'top':
        return {
          top: targetRect.top - tooltipRect.height - offset,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
        };
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
        };
      case 'left':
        return {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.left - tooltipRect.width - offset
        };
      case 'right':
        return {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.right + offset
        };
      default:
        return { top: 0, left: 0 };
    }
  };

  // 计算提示框位置
  useEffect(() => {
    if (!isActive || !step) {
      return;
    }

    const calculatePosition = () => {
      const targetElement = document.querySelector(step.targetElement);
      if (!targetElement) return;

      const targetRect = targetElement.getBoundingClientRect();
      
      // 如果没有tooltip元素，先设置一个默认位置使其可见
      if (!tooltipRef.current) {
        setTooltipPosition({ 
          top: targetRect.top - 100, 
          left: targetRect.left + (targetRect.width - 100) / 2 
        });
        setVisible(true);
        setCurrentPositionString(position === 'auto' ? 'bottom' : position);
        return;
      }

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let calculatedPosition = position;
      
      // 自动调整位置以避免超出视口
      if (position === 'auto') {
        const positions = ['top', 'bottom', 'left', 'right'];
        calculatedPosition = positions.find(pos => {
          const { top, left } = getPositionForDirection(pos, targetRect, tooltipRect, offset);
          return (
            top >= 0 &&
            left >= 0 &&
            top + tooltipRect.height <= viewportHeight &&
            left + tooltipRect.width <= viewportWidth
          );
        }) || 'bottom';
      }

      const { top, left } = getPositionForDirection(calculatedPosition, targetRect, tooltipRect, offset);
      
      setTooltipPosition({ top, left });
      setVisible(true);
      setCurrentPositionString(calculatedPosition);
    };

    // 添加防抖和重排监听
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(calculatePosition, 100);
    });

    const targetElement = document.querySelector(step.targetElement);
    if (targetElement) {
      resizeObserver.observe(targetElement);
      resizeObserver.observe(document.body);
    }

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isActive, step, position, offset]);

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

  if (!isActive || !step || !visible) {
    return null;
  }

  const { title, content, isLast } = step;

  return (
    <div
      ref={tooltipRef}
      className={`guide-tooltip-simple guide-tooltip-simple--${currentPositionString} ${className}`}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex
      }}
      role="tooltip"
      aria-labelledby="guide-tooltip-title"
      aria-describedby="guide-tooltip-content"
    >
      {/* 箭头 */}
      {showArrow && (
        <div className={`guide-tooltip-arrow guide-tooltip-arrow--${currentPositionString}`} />
      )}
      
      {/* 内容区域 */}
      <div className="guide-tooltip-simple-content">
        {title && (
          <h3 id="guide-tooltip-title" className="guide-tooltip-title">
            {title}
          </h3>
        )}
        
        {content && (
          <div id="guide-tooltip-content" className="guide-tooltip-content">
            {typeof content === 'string' ? (
              <p>{content}</p>
            ) : (
              content
            )}
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="guide-tooltip-actions">
          {onPrevious && (
            <button
              type="button"
              className="guide-tooltip-button guide-tooltip-button--secondary"
              onClick={onPrevious}
              aria-label="上一步"
            >
              上一步
            </button>
          )}
          
          <button
            type="button"
            className="guide-tooltip-button guide-tooltip-button--primary"
            onClick={onNext}
            aria-label={isLast ? "完成引导" : "下一步"}
          >
            {isLast ? '完成' : '下一步'}
          </button>
          
          {onClose && (
            <button
              type="button"
              className="guide-tooltip-close"
              onClick={onClose}
              aria-label="关闭引导"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

GuideTooltip.propTypes = {
  /** 当前引导步骤配置 */
  step: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    targetElement: PropTypes.string.isRequired,
    isLast: PropTypes.bool
  }),
  /** 是否激活显示 */
  isActive: PropTypes.bool,
  /** 下一步回调 */
  onNext: PropTypes.func,
  /** 上一步回调 */
  onPrevious: PropTypes.func,
  /** 关闭引导回调 */
  onClose: PropTypes.func,
  /** 提示框位置 */
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'auto']),
  /** 是否显示箭头 */
  showArrow: PropTypes.bool,
  /** 与目标元素的偏移距离 */
  offset: PropTypes.number,
  /** z-index 层级 */
  zIndex: PropTypes.number,
  /** 自定义类名 */
  className: PropTypes.string
};

export default GuideTooltip;