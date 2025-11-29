/**
 * 简单的事件发射器
 * 提供事件发布订阅功能
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  /**
   * 监听事件
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 事件监听器
   * @returns {Function} 取消监听函数
   */
  on(eventName, listener) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    this.events.get(eventName).add(listener);
    
    // 返回取消监听函数
    return () => this.off(eventName, listener);
  }
  
  /**
   * 监听一次事件
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 事件监听器
   */
  once(eventName, listener) {
    const onceListener = (...args) => {
      listener(...args);
      this.off(eventName, onceListener);
    };
    
    this.on(eventName, onceListener);
  }
  
  /**
   * 取消监听事件
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 事件监听器
   */
  off(eventName, listener) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(listener);
      
      // 如果没有监听器了，删除事件
      if (this.events.get(eventName).size === 0) {
        this.events.delete(eventName);
      }
    }
  }
  
  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {...any} args - 事件参数
   */
  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      // 复制监听器集合，避免在迭代过程中修改
      const listeners = new Set(this.events.get(eventName));
      
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }
  
  /**
   * 获取事件监听器数量
   * @param {string} eventName - 事件名称
   */
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).size : 0;
  }
  
  /**
   * 移除所有事件监听器
   * @param {string} eventName - 事件名称（可选，为空则移除所有）
   */
  removeAllListeners(eventName = null) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }
}