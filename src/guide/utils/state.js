// 用于单路由临时状态储存
let currentState = {};

// 设置状态值
export function setState(key, value) {
  currentState[key] = value;
}

// 获取状态值
export function getState(key) {
  return key ? currentState[key] : currentState;
}

// 重置状态
export function resetState() {
  currentState = {};
}