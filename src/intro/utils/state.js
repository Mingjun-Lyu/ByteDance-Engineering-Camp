let currentState = {};

export function setState(key, value) {
  currentState[key] = value;
}

export function getState(key) {
  return key ? currentState[key] : currentState;
}

export function resetState() {
  currentState = {};
}