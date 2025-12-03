// 存储注册的事件监听器，键为事件名称，值为回调函数
let registeredListeners = {};

// 注册事件监听器
export function listen(hook, callback) {
  registeredListeners[hook] = callback;
}

// 触发事件
export function emit(hook) {
  // 使用可选链操作符安全调用回调函数
  registeredListeners[hook]?.();
}

// 销毁事件发射器
export function destroyEmitter() {
  registeredListeners = {};
}