import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './GuideControlPanel.css';

/**
 * 引导控制面板组件
 * 提供引导流程的独立控制界面
 */
const GuideControlPanel = ({
  currentStep,
  totalSteps,
  isActive = false,
  isPaused = false,
  onStart,
  onPause,
  onResume,
  onNext,
  onPrevious,
  onRestart,
  onClose,
  position = 'bottom-right',
  showProgress = true,
  showStepInfo = true,
  compact = false,
  zIndex = 9997,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // 处理面板展开/收起
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 计算进度百分比
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  if (!isActive) {
    return null;
  }

  return (
    <div 
      className={`guide-control-panel guide-control-panel--${position} ${compact ? 'guide-control-panel--compact' : ''} ${className}`}
      style={{ zIndex }}
      role="complementary"
      aria-label="引导控制面板"
    >
      {/* 紧凑模式下的切换按钮 */}
      {compact && (
        <button
          type="button"
          className="guide-control-toggle"
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "收起控制面板" : "展开控制面板"}
        >
          <span className="guide-control-toggle-icon">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
      )}

      {/* 面板内容 */}
      <div className={`guide-control-content ${isExpanded ? 'guide-control-content--expanded' : ''}`}>
        {/* 标题和关闭按钮 */}
        <div className="guide-control-header">
          <h4 className="guide-control-title">引导控制</h4>
          {onClose && (
            <button
              type="button"
              className="guide-control-close"
              onClick={onClose}
              aria-label="关闭引导控制面板"
            >
              ×
            </button>
          )}
        </div>

        {/* 进度信息 */}
        {showProgress && (
          <div className="guide-control-progress">
            <div className="guide-control-progress-info">
              <span className="guide-control-step-text">
                步骤 {currentStep} / {totalSteps}
              </span>
              <span className="guide-control-percentage">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="guide-control-progress-bar">
              <div 
                className="guide-control-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 步骤信息 */}
        {showStepInfo && currentStep > 0 && (
          <div className="guide-control-step-info">
            <span className="guide-control-current-step">
              当前步骤: {currentStep}
            </span>
          </div>
        )}

        {/* 控制按钮组 */}
        <div className="guide-control-buttons">
          {/* 开始/暂停/恢复按钮 */}
          <div className="guide-control-primary-buttons">
            {!isPaused && currentStep === 0 ? (
              <button
                type="button"
                className="guide-control-button guide-control-button--primary"
                onClick={onStart}
                aria-label="开始引导"
              >
                开始引导
              </button>
            ) : isPaused ? (
              <button
                type="button"
                className="guide-control-button guide-control-button--primary"
                onClick={onResume}
                aria-label="继续引导"
              >
                继续
              </button>
            ) : (
              <button
                type="button"
                className="guide-control-button guide-control-button--secondary"
                onClick={onPause}
                aria-label="暂停引导"
              >
                暂停
              </button>
            )}
          </div>

          {/* 导航按钮 */}
          {currentStep > 0 && (
            <div className="guide-control-navigation">
              <button
                type="button"
                className="guide-control-button guide-control-button--secondary"
                onClick={onPrevious}
                disabled={currentStep <= 1}
                aria-label="上一步"
              >
                上一步
              </button>
              
              <button
                type="button"
                className="guide-control-button guide-control-button--primary"
                onClick={onNext}
                disabled={currentStep >= totalSteps}
                aria-label={currentStep >= totalSteps ? "完成引导" : "下一步"}
              >
                {currentStep >= totalSteps ? '完成' : '下一步'}
              </button>
            </div>
          )}

          {/* 辅助操作 */}
          <div className="guide-control-actions">
            <button
              type="button"
              className="guide-control-button guide-control-button--text"
              onClick={onRestart}
              aria-label="重新开始引导"
            >
              重新开始
            </button>
            
            {onClose && (
              <button
                type="button"
                className="guide-control-button guide-control-button--text"
                onClick={onClose}
                aria-label="结束引导"
              >
                结束
              </button>
            )}
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="guide-control-status">
          <div className={`guide-control-status-indicator ${isPaused ? 'guide-control-status-indicator--paused' : 'guide-control-status-indicator--active'}`}>
            <span className="guide-control-status-dot" />
            <span className="guide-control-status-text">
              {isPaused ? '已暂停' : '进行中'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

GuideControlPanel.propTypes = {
  /** 当前步骤编号 */
  currentStep: PropTypes.number.isRequired,
  /** 总步骤数 */
  totalSteps: PropTypes.number.isRequired,
  /** 是否激活显示 */
  isActive: PropTypes.bool,
  /** 是否暂停状态 */
  isPaused: PropTypes.bool,
  /** 开始引导回调 */
  onStart: PropTypes.func,
  /** 暂停引导回调 */
  onPause: PropTypes.func,
  /** 恢复引导回调 */
  onResume: PropTypes.func,
  /** 下一步回调 */
  onNext: PropTypes.func,
  /** 上一步回调 */
  onPrevious: PropTypes.func,
  /** 重新开始回调 */
  onRestart: PropTypes.func,
  /** 关闭引导回调 */
  onClose: PropTypes.func,
  /** 面板位置 */
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  /** 是否显示进度 */
  showProgress: PropTypes.bool,
  /** 是否显示步骤信息 */
  showStepInfo: PropTypes.bool,
  /** 是否使用紧凑模式 */
  compact: PropTypes.bool,
  /** z-index 层级 */
  zIndex: PropTypes.number,
  /** 自定义类名 */
  className: PropTypes.string
};

export default GuideControlPanel;