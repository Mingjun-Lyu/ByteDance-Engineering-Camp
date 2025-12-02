let currentState = {};
const STEP_RECORD_KEY = 'intro_step_record';

// 记录当前步骤（只在导航操作时调用）
export function recordCurrentStep(stepIndex) {
  try {
    localStorage.setItem(STEP_RECORD_KEY, stepIndex.toString());
  } catch (error) {
    console.warn('Failed to record current step:', error);
  }
}

// 获取记录的步骤（用于恢复现场）
export function getRecordedStep() {
  try {
    const saved = localStorage.getItem(STEP_RECORD_KEY);
    return saved !== null ? parseInt(saved) : 0;
  } catch (error) {
    return 0;
  }
}

// 清除步骤记录（只在用户选择重新引导时调用）
export function clearStepRecord() {
  try {
    localStorage.removeItem(STEP_RECORD_KEY);
  } catch (error) {
    console.warn('Failed to clear step record:', error);
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