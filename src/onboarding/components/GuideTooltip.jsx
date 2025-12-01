import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './GuideTooltip.css';

/**
 * 基于DriverJS设计理念的步骤提示框组件
 * 使用DriverJS的元素定位方法和布局算法
 */
const GuideTooltip = ({
  step,
  isActive = false,
  onNext,
  onPrevious,
  onClose,
  side = 'bottom',
  align = 'start',
  showArrow = true,
  stagePadding = 0,
  popoverOffset = 10,
  zIndex = 1000000000,
  className = ''
}) => {
  const tooltipRef = useRef(null);
  const arrowRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const [currentSide, setCurrentSide] = useState(side);
  const [currentAlign, setCurrentAlign] = useState(align);

  // 水平方向对齐计算
  const calculateHorizontalPosition = (targetRect, tooltipRect, alignment) => {
    switch (alignment) {
      case 'start':
        return targetRect.left;
      case 'end':
        return targetRect.right - tooltipRect.width;
      case 'center':
      default:
        return targetRect.left + (targetRect.width - tooltipRect.width) / 2;
    }
  };

  // 垂直方向对齐计算
  const calculateVerticalPosition = (targetRect, tooltipRect, alignment) => {
    switch (alignment) {
      case 'start':
        return targetRect.top;
      case 'end':
        return targetRect.bottom - tooltipRect.height;
      case 'center':
      default:
        return targetRect.top + (targetRect.height - tooltipRect.height) / 2;
    }
  };

  // 基于DriverJS的智能位置计算
  const calculateOptimalPosition = useCallback((targetRect, tooltipRect, requiredSide, requiredAlign) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const arrowSize = 10; // 箭头大小

    // 检查各个方向的可用空间
    const topSpace = targetRect.top - tooltipRect.height - stagePadding - arrowSize;
    const bottomSpace = viewportHeight - targetRect.bottom - tooltipRect.height - stagePadding - arrowSize;
    const leftSpace = targetRect.left - tooltipRect.width - stagePadding - arrowSize;
    const rightSpace = viewportWidth - targetRect.right - tooltipRect.width - stagePadding - arrowSize;

    // 确定最优方向
    let optimalSide = requiredSide;
    if (requiredSide === 'auto') {
      const sides = ['top', 'bottom', 'left', 'right'];
      const availableSides = sides.filter(side => {
        switch (side) {
          case 'top': return topSpace >= 0;
          case 'bottom': return bottomSpace >= 0;
          case 'left': return leftSpace >= 0;
          case 'right': return rightSpace >= 0;
          default: return false;
        }
      });
      optimalSide = availableSides.length > 0 ? availableSides[0] : 'bottom';
    }

    // 计算位置
    let top = 0;
    let left = 0;

    switch (optimalSide) {
      case 'top':
        top = targetRect.top - tooltipRect.height - popoverOffset;
        left = calculateHorizontalPosition(targetRect, tooltipRect, requiredAlign);
        break;
      case 'bottom':
        top = targetRect.bottom + popoverOffset;
        left = calculateHorizontalPosition(targetRect, tooltipRect, requiredAlign);
        break;
      case 'left':
        left = targetRect.left - tooltipRect.width - popoverOffset;
        top = calculateVerticalPosition(targetRect, tooltipRect, requiredAlign);
        break;
      case 'right':
        left = targetRect.right + popoverOffset;
        top = calculateVerticalPosition(targetRect, tooltipRect, requiredAlign);
        break;
      default:
        // 居中显示
        top = (viewportHeight - tooltipRect.height) / 2;
        left = (viewportWidth - tooltipRect.width) / 2;
    }

    // 边界检查
    top = Math.max(stagePadding, Math.min(top, viewportHeight - tooltipRect.height - stagePadding));
    left = Math.max(stagePadding, Math.min(left, viewportWidth - tooltipRect.width - stagePadding));

    return { top, left, side: optimalSide, align: requiredAlign };
  }, [stagePadding, popoverOffset]);

  // 计算提示框位置 - 基于DriverJS的智能定位算法
  useEffect(() => {
    if (!isActive || !step) {
      // 使用requestAnimationFrame避免同步setState调用
      requestAnimationFrame(() => setVisible(false));
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
        setCurrentSide(side === 'auto' ? 'bottom' : side);
        setCurrentAlign(align);
        return;
      }

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const positionData = calculateOptimalPosition(targetRect, tooltipRect, side, align);
      
      setTooltipPosition({ top: positionData.top, left: positionData.left });
      setCurrentSide(positionData.side);
      setCurrentAlign(positionData.align);
      setVisible(true);
    };

    // 使用requestAnimationFrame优化性能
    const debouncedCalculatePosition = () => {
      requestAnimationFrame(calculatePosition);
    };

    // 添加防抖和重排监听
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(debouncedCalculatePosition, 100);
    });

    const targetElement = document.querySelector(step.targetElement);
    if (targetElement) {
      resizeObserver.observe(targetElement);
      resizeObserver.observe(document.body);
    }

    debouncedCalculatePosition();
    window.addEventListener('resize', debouncedCalculatePosition);
    window.addEventListener('scroll', debouncedCalculatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedCalculatePosition);
      window.removeEventListener('scroll', debouncedCalculatePosition, true);
    };
  }, [isActive, step, side, align, calculateOptimalPosition]);

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

  const { title, content, isLast, showProgress, progressText } = step;

  return (
    <div
      ref={tooltipRef}
      className={`driver-popover guide-tooltip ${className}`}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex
      }}
      role="dialog"
      aria-labelledby="driver-popover-title"
      aria-describedby="driver-popover-description"
    >
      {/* 箭头 - 基于DriverJS的箭头设计 */}
      {showArrow && (
        <div 
          ref={arrowRef}
          className={`driver-popover-arrow driver-popover-arrow--${currentSide} driver-popover-arrow--${currentAlign}`}
        />
      )}
      
      {/* 内容区域 - 基于DriverJS的布局 */}
      <div className="driver-popover-content">
        {title && (
          <h3 id="driver-popover-title" className="driver-popover-title">
            {title}
          </h3>
        )}
        
        {content && (
          <div id="driver-popover-description" className="driver-popover-description">
            {typeof content === 'string' ? (
              <p>{content}</p>
            ) : (
              content
            )}
          </div>
        )}
        
        {/* 操作按钮 - 基于DriverJS的按钮布局 */}
        <div className="driver-popover-footer">
          {/* 进度显示 */}
          {(showProgress || progressText) && (
            <div className="driver-popover-progress-text">
              {progressText || `步骤 ${step.stepIndex || 1}`}
            </div>
          )}
          
          <div className="driver-popover-navigation-btns">
            {onPrevious && (
              <button
                type="button"
                className="driver-popover-prev-btn"
                onClick={onPrevious}
                aria-label="上一步"
              >
                &larr; 上一步
              </button>
            )}
            
            <button
              type="button"
              className="driver-popover-next-btn"
              onClick={onNext}
              aria-label={isLast ? "完成引导" : "下一步"}
            >
              {isLast ? '完成' : '下一步 &rarr;'}
            </button>
            
            {onClose && (
              <button
                type="button"
                className="driver-popover-close-btn"
                onClick={onClose}
                aria-label="关闭引导"
              >
                ×
              </button>
            )}
          </div>
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
    isLast: PropTypes.bool,
    showProgress: PropTypes.bool,
    progressText: PropTypes.string,
    stepIndex: PropTypes.number
  }),
  /** 是否激活显示 */
  isActive: PropTypes.bool,
  /** 下一步回调 */
  onNext: PropTypes.func,
  /** 上一步回调 */
  onPrevious: PropTypes.func,
  /** 关闭引导回调 */
  onClose: PropTypes.func,
  /** 提示框位置方向 */
  side: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'auto', 'over']),
  /** 对齐方式 */
  align: PropTypes.oneOf(['start', 'center', 'end']),
  /** 是否显示箭头 */
  showArrow: PropTypes.bool,
  /** 舞台边距 */
  stagePadding: PropTypes.number,
  /** 与目标元素的偏移距离 */
  popoverOffset: PropTypes.number,
  /** z-index 层级 */
  zIndex: PropTypes.number,
  /** 自定义类名 */
  className: PropTypes.string
};

export default GuideTooltip;