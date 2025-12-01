/**
 * 内存存储（回退方案）
 */
class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
  
  setItem(key, value) {
    this.data.set(key, value);
  }
  
  getItem(key) {
    return this.data.get(key) || null;
  }
  
  removeItem(key) {
    this.data.delete(key);
  }
  
  clear() {
    this.data.clear();
  }
}

/**
 * 存储管理器
 * 提供统一的存储接口，支持 localStorage 和 sessionStorage
 */
export class StorageManager {
  constructor(storageKey, options = {}) {
    this.storageKey = storageKey;
    this.options = {
      storageType: 'localStorage', // 'localStorage' | 'sessionStorage'
      fallback: true,
      ...options
    };
    
    this.storage = this.getStorage();
  }
  
  /**
   * 获取存储实例
   */
  getStorage() {
    try {
      // 检查window对象是否存在
      if (typeof window === 'undefined') {
        throw new Error('Window object not available');
      }
      
      if (this.options.storageType === 'sessionStorage' && window.sessionStorage) {
        return window.sessionStorage;
      }
      
      if (window.localStorage) {
        return window.localStorage;
      }
      
      throw new Error('No storage available');
    } catch {
      if (this.options.fallback) {
        console.warn('Storage not available, using memory fallback');
        return new MemoryStorage();
      }
      throw new Error('Storage not available and no fallback');
    }
  }
  
  /**
   * 保存数据
   * @param {any} data - 要保存的数据
   * @param {string} key - 存储键名（可选，默认为主键）
   */
  async save(data, key = null) {
    try {
      const storage = this.getStorage();
      const storageKey = key ? `${this.storageKey}_${key}` : this.storageKey;
      const serializedData = JSON.stringify(data);
      storage.setItem(storageKey, serializedData);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 加载数据
   * @param {string} key - 存储键名（可选，默认为主键）
   */
  async load(key = null) {
    try {
      const storage = this.getStorage();
      const storageKey = key ? `${this.storageKey}_${key}` : this.storageKey;
      const data = storage.getItem(storageKey);
      
      // 如果数据不存在或为null，返回null
      if (data === null || data === undefined) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('StorageManager load error:', error);
      return null;
    }
  }
  
  /**
   * 清除数据
   * @param {string} key - 存储键名（可选，默认为主键）
   */
  async clear(key = null) {
    try {
      const storageKey = key ? `${this.storageKey}_${key}` : this.storageKey;
      this.storage.removeItem(storageKey);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 检查存储是否可用
   */
  static isAvailable(storageType = 'localStorage') {
    try {
      // 检查window对象是否存在
      if (typeof window === 'undefined') {
        return false;
      }
      
      const storage = storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}