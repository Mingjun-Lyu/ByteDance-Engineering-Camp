let currentState = {};
const STEP_RECORD_KEY = 'intro_step_record';
const GUIDE_STATE_KEY = 'intro_guide_state';
const PANEL_VISIBLE_KEY = 'intro_panel_visible';

// 记录当前步骤（只在导航操作时调用）
export function recordCurrentStep(stepIndex) {
  try {
    localStorage.setItem(STEP_RECORD_KEY, stepIndex.toString());
    // 同时保存到完整状态中
    saveGuideState({
      ...loadGuideState(),
      currentStepIndex: stepIndex
    });
  } catch (error) {
    console.warn('Failed to record current step:', error);
  }
}

// 获取记录的步骤（用于恢复现场）
export function getRecordedStep() {
  try {
    const saved = localStorage.getItem(STEP_RECORD_KEY);
    return saved !== null ? parseInt(saved) : 0;
  } catch {
    return 0;
  }
}

// 清除步骤记录（只在用户选择重新引导时调用）
export function clearStepRecord() {
  try {
    localStorage.removeItem(STEP_RECORD_KEY);
    localStorage.removeItem(GUIDE_STATE_KEY);
  } catch (error) {
    console.warn('Failed to clear step record:', error);
  }
}

// 保存完整的引导状态
export function saveGuideState(state) {
  try {
    localStorage.setItem(GUIDE_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save guide state:', error);
  }
}

// 加载完整的引导状态
export function loadGuideState() {
  try {
    const saved = localStorage.getItem(GUIDE_STATE_KEY);
    return saved ? JSON.parse(saved) : {
      currentStepIndex: 0,
      isGuideActive: false,
      guideConfig: null,
      configError: null
    };
  } catch (error) {
    console.warn('Failed to load guide state:', error);
    return {
      currentStepIndex: 0,
      isGuideActive: false,
      guideConfig: null,
      configError: null
    };
  }
}

// 保存当前步骤索引
export function saveCurrentStepIndex(stepIndex) {
  try {
    localStorage.setItem(STEP_RECORD_KEY, stepIndex.toString());
    const currentState = loadGuideState();
    saveGuideState({
      ...currentState,
      currentStepIndex: stepIndex
    });
  } catch (error) {
    console.warn('Failed to save current step index:', error);
  }
}

// 获取当前步骤索引
export function getCurrentStepIndex() {
  try {
    const state = loadGuideState();
    return state.currentStepIndex || 0;
  } catch {
    return 0;
  }
}

// 保存引导激活状态
export function saveGuideActiveStatus(isActive) {
  try {
    const currentState = loadGuideState();
    saveGuideState({
      ...currentState,
      isGuideActive: isActive
    });
  } catch (error) {
    console.warn('Failed to save guide active status:', error);
  }
}

// 获取引导激活状态
export function getGuideActiveStatus() {
  try {
    const state = loadGuideState();
    return state.isGuideActive || false;
  } catch {
    return false;
  }
}

export function setState(key, value) {
  currentState[key] = value;
}

export function getState(key) {
  return key ? currentState[key] : currentState;
}

export function resetState() {
  currentState = {};
  // 注意：不自动清除步骤记录，保持持久化
}

// 保存面板显示状态
export function savePanelVisible(isVisible) {
  try {
    localStorage.setItem(PANEL_VISIBLE_KEY, JSON.stringify({
      isVisible,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to save panel visible state:', error);
  }
}

// 获取面板显示状态
export function getPanelVisible() {
  try {
    const record = localStorage.getItem(PANEL_VISIBLE_KEY);
    return record ? JSON.parse(record) : null;
  } catch (error) {
    console.warn('Failed to get panel visible state:', error);
    return null;
  }
}

// 清除面板显示状态
export function clearPanelVisible() {
  try {
    localStorage.removeItem(PANEL_VISIBLE_KEY);
  } catch (error) {
    console.warn('Failed to clear panel visible state:', error);
  }
}