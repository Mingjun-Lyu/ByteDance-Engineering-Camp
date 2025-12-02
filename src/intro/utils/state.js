let currentState = {};
const STEP_RECORD_KEY = 'intro_step_record';
const GUIDE_STATE_KEY = 'intro_guide_state';

// 定义引导状态
const GUIDE_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// 记录当前步骤和引导状态（先记录再处理）
export function recordCurrentStep(stepIndex, isGuiding = false) {
  try {
    // 记录步骤索引（从0开始）
    localStorage.setItem(STEP_RECORD_KEY, stepIndex.toString());
    
    // 记录完整引导状态
    const guideState = {
      step: stepIndex,
      status: isGuiding ? GUIDE_STATES.IN_PROGRESS : GUIDE_STATES.NOT_STARTED,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(GUIDE_STATE_KEY, JSON.stringify(guideState));
  } catch (error) {
    console.warn('Failed to record guide state:', error);
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

// 获取完整的引导状态
export function getGuideState() {
  try {
    const saved = localStorage.getItem(GUIDE_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      return {
        step: state.step || 0,
        status: state.status || GUIDE_STATES.NOT_STARTED,
        isGuiding: state.status === GUIDE_STATES.IN_PROGRESS
      };
    }
  } catch (error) {
    console.warn('Failed to get guide state:', error);
  }
  return { step: 0, status: GUIDE_STATES.NOT_STARTED, isGuiding: false };
}

// 设置引导状态
export function setGuideStatus(isGuiding) {
  const currentState = getGuideState();
  recordCurrentStep(currentState.step, isGuiding);
}

// 清除步骤记录（只在用户选择重新引导时调用）
export function clearStepRecord() {
  try {
    localStorage.removeItem(STEP_RECORD_KEY);
  } catch (error) {
    console.warn('Failed to clear step record:', error);
  }
}

// 清除完整的引导状态
export function clearGuideState() {
  try {
    localStorage.removeItem(GUIDE_STATE_KEY);
    localStorage.removeItem(STEP_RECORD_KEY);
  } catch (error) {
    console.warn('Failed to clear guide state:', error);
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