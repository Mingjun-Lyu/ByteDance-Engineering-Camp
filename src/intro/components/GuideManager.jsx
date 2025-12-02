import React, { useEffect } from "react";
import GuidePanel from './GuidePanel';
import { 
  useGuideRouting,
  useGuideConfig,
  useGuideState,
  useGuideFlow 
} from '../hooks';

const GuideManager = ({ 
  children, 
  position = 'top-center',
  onGuideStart,
  onGuideComplete
}) => {
  // 使用自定义hooks
  const routing = useGuideRouting();
  const config = useGuideConfig();
  const state = useGuideState(config.guideConfig);
  const flow = useGuideFlow(state.isGuideActive, config.guideConfig, routing.currentPath, routing);

  // 恢复引导状态
  useEffect(() => {
    if (config.guideConfig) {
      state.restoreGuideState(routing);
    }
  }, [config.guideConfig, routing]);

  // 处理引导开始
  const handleGuideStart = () => {
    const validation = flow.validateGuideStart(config, state);
    if (!validation.isValid) {
      alert(`${validation.message}\n\n错误信息：${validation.error}`);
      return;
    }
    
    state.startGuide(onGuideStart, (stepIndex) => {
      flow.handleStepNavigation(stepIndex, config, routing);
    });
  };

  // 处理引导完成
  const handleGuideComplete = () => {
    state.completeGuide(onGuideComplete);
  };

  // 处理步骤变化
  const handleStepChange = (newStepIndex) => {
    state.handleStepChange(newStepIndex, (stepIndex) => {
      flow.handleStepNavigation(stepIndex, config, routing);
    });
  };

  // 如果配置加载失败，不显示引导面板
  if (!flow.shouldShowPanel(config)) {
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
        onStepChange={handleStepChange}
        guideConfig={config.guideConfig}
      />
      
      {/* 引导遮罩层（如果引导正在进行） */}
      {flow.shouldShowOverlay(state.isGuideActive) && (
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