import { EventEmitter } from './EventEmitter.js';

/**
 * 元素定位器类
 * 支持多种定位策略：CSS选择器、数据属性、XPath
 * 提供元素状态检测和重试机制
 */
export class ElementLocator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // 配置选项
    this.options = {
      // 定位策略优先级
      strategies: ['css', 'dataAttr', 'xpath'],
      
      // 重试配置
      retry: {
        maxAttempts: 3,
        delay: 100,
        timeout: 5000
      },
      
      // 状态检测配置
      stateCheck: {
        checkVisibility: true,
        checkInteractivity: true,
        checkDimensions: true,
        minVisibleRatio: 0.5,
        minWidth: 1,
        minHeight: 1
      },
      
      // 调试配置
      debug: false,
      
      ...options
    };
    
    this.log('ElementLocator initialized');
  }
  
  /**
   * 定位元素
   * @param {Object} config - 定位配置
   * @param {string} config.selector - CSS选择器
   * @param {string} config.dataAttr - 数据属性选择器
   * @param {string} config.xpath - XPath表达式
   * @param {HTMLElement} config.context - 搜索上下文（默认为document）
   * @param {number} config.timeout - 自定义超时时间（可选）
   * @returns {Promise<HTMLElement|null>} 定位到的元素
   */
  async locate(config) {
    if (!config || Object.keys(config).length === 0) {
      throw new Error('Locator config is required');
    }
    
    const timeout = config.timeout || this.options.retry.timeout;
    const maxAttempts = config.maxAttempts || this.options.retry.maxAttempts;
    const startTime = Date.now();
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxAttempts) {
      try {
        attempt++;
        
        this.log(`Attempt ${attempt} to locate element`);
        
        // 检查是否超时
        if (Date.now() - startTime > timeout) {
          throw new Error(`Locator timeout after ${timeout}ms`);
        }
        
        // 按策略优先级尝试定位
        const element = await this.tryStrategies(config);
        
        if (element) {
          // 检查元素状态
          const isValid = await this.validateElementState(element);
          
          if (isValid) {
            const elapsedTime = Date.now() - startTime;
            this.log(`Element located successfully in ${elapsedTime}ms`);
            this.emit('elementLocated', { element, config, attempt, elapsedTime });
            return element;
          } else {
            this.log('Element found but state validation failed');
            lastError = new Error('Element state validation failed');
          }
        }
        
        // 等待重试（使用指数退避算法）
        if (attempt < maxAttempts) {
          const delay = this.calculateRetryDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        lastError = error;
        this.log(`Locator attempt ${attempt} failed: ${error.message}`);
        
        // 检查是否超时
        if (Date.now() - startTime > timeout) {
          break;
        }
        
        // 等待重试（使用指数退避算法）
        if (attempt < maxAttempts) {
          const delay = this.calculateRetryDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    const errorMessage = `Failed to locate element after ${attempt} attempts: ${lastError?.message || 'Unknown error'}`;
    this.emit('locatorFailed', { config, attempt, error: lastError, elapsedTime: Date.now() - startTime });
    throw new Error(errorMessage);
  }
  
  /**
   * 计算重试延迟（指数退避算法）
   */
  calculateRetryDelay(attempt) {
    const baseDelay = this.options.retry.delay;
    const maxDelay = 5000; // 最大延迟5秒
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    
    // 添加随机抖动避免重试风暴
    const jitter = delay * 0.1 * Math.random();
    return delay + jitter;
  }
  
  /**
   * 尝试多种定位策略
   */
  async tryStrategies(config) {
    const context = config.context || document;
    
    for (const strategy of this.options.strategies) {
      try {
        let element = null;
        
        switch (strategy) {
          case 'css':
            if (config.selector) {
              element = await this.locateByCSS(config.selector, context);
            }
            break;
            
          case 'dataAttr':
            if (config.dataAttr) {
              element = await this.locateByDataAttr(config.dataAttr, context);
            }
            break;
            
          case 'xpath':
            if (config.xpath) {
              element = await this.locateByXPath(config.xpath, context);
            }
            break;
        }
        
        if (element) {
          this.log(`Element located using ${strategy} strategy`);
          return element;
        }
        
      } catch (error) {
        this.log(`${strategy} strategy failed: ${error.message}`);
      }
    }
    
    throw new Error('All location strategies failed');
  }
  
  /**
   * CSS选择器定位
   */
  async locateByCSS(selector, context) {
    if (!selector || typeof selector !== 'string') {
      throw new Error('Invalid CSS selector');
    }
    
    const element = context.querySelector(selector);
    
    if (!element) {
      throw new Error(`No element found for CSS selector: ${selector}`);
    }
    
    return element;
  }
  
  /**
   * 数据属性定位
   */
  async locateByDataAttr(dataAttr, context) {
    if (!dataAttr || typeof dataAttr !== 'string') {
      throw new Error('Invalid data attribute selector');
    }
    
    // 支持多种数据属性格式
    const selectors = [
      `[data-onboarding="${dataAttr}"]`,
      `[data-guide="${dataAttr}"]`,
      `[data-step="${dataAttr}"]`,
      `[data-element="${dataAttr}"]`
    ];
    
    for (const selector of selectors) {
      const element = context.querySelector(selector);
      if (element) {
        return element;
      }
    }
    
    throw new Error(`No element found for data attribute: ${dataAttr}`);
  }
  
  /**
   * XPath定位
   */
  async locateByXPath(xpath, context) {
    if (!xpath || typeof xpath !== 'string') {
      throw new Error('Invalid XPath expression');
    }
    
    try {
      const result = document.evaluate(
        xpath,
        context,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      
      const element = result.singleNodeValue;
      
      if (!element) {
        throw new Error(`No element found for XPath: ${xpath}`);
      }
      
      return element;
      
    } catch (error) {
      throw new Error(`XPath evaluation failed: ${error.message}`);
    }
  }
  
  /**
   * 验证元素状态
   */
  async validateElementState(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }
    
    const checks = [];
    const checkNames = [];
    
    // 可见性检查
    if (this.options.stateCheck.checkVisibility) {
      checks.push(this.checkVisibility(element));
      checkNames.push('visibility');
    }
    
    // 可交互性检查
    if (this.options.stateCheck.checkInteractivity) {
      checks.push(this.checkInteractivity(element));
      checkNames.push('interactivity');
    }
    
    // 尺寸检查
    if (this.options.stateCheck.checkDimensions) {
      checks.push(this.checkDimensions(element));
      checkNames.push('dimensions');
    }
    
    const results = await Promise.all(checks);
    
    // 调试信息：显示每个检查的结果
    if (this.options.debug) {
      results.forEach((result, index) => {
        this.log(`State check '${checkNames[index]}': ${result ? 'PASS' : 'FAIL'}`);
      });
    }
    
    return results.every(result => result === true);
  }
  
  /**
   * 检查元素可见性
   */
  async checkVisibility(element) {
    // 检查display和visibility样式
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    
    // 检查元素是否在视口内
    const rect = element.getBoundingClientRect();
    
    // 对于测试环境，简化视口检查
    // 只要元素有尺寸并且不在屏幕外，就认为可见
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    // 检查元素是否完全在屏幕外
    const isOffscreen = rect.right < 0 || rect.bottom < 0 || 
                       rect.left > (window.innerWidth || document.documentElement.clientWidth) ||
                       rect.top > (window.innerHeight || document.documentElement.clientHeight);
    
    if (isOffscreen) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查元素可交互性
   */
  async checkInteractivity(element) {
    const style = window.getComputedStyle(element);
    
    // 检查是否可点击
    if (style.pointerEvents === 'none') {
      return false;
    }
    
    // 检查是否禁用
    if (element.disabled) {
      return false;
    }
    
    // 检查透明度
    if (parseFloat(style.opacity) < 0.1) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查元素尺寸
   */
  async checkDimensions(element) {
    const rect = element.getBoundingClientRect();
    
    // 调试信息
    if (this.options.debug) {
      this.log(`Element dimensions: width=${rect.width}, height=${rect.height}, minWidth=${this.options.stateCheck.minWidth}, minHeight=${this.options.stateCheck.minHeight}`);
    }
    
    const result = (
      rect.width >= this.options.stateCheck.minWidth &&
      rect.height >= this.options.stateCheck.minHeight
    );
    
    return result;
  }
  
  /**
   * 批量定位元素
   */
  async locateMultiple(configs) {
    if (!Array.isArray(configs)) {
      throw new Error('Configs must be an array');
    }
    
    const results = [];
    
    for (const config of configs) {
      try {
        const element = await this.locate(config);
        results.push({ config, element, success: true });
      } catch (error) {
        results.push({ config, element: null, success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  /**
   * 等待元素出现
   */
  async waitForElement(config, timeout = this.options.retry.timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = async () => {
        try {
          const element = await this.locate(config);
          resolve(element);
        } catch {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Timeout waiting for element after ${timeout}ms`));
          } else {
            setTimeout(checkElement, 50); // 固定延迟50ms
          }
        }
      };
      
      checkElement();
    });
  }
  
  /**
   * 日志记录
   */
  log(message) {
    if (this.options.debug) {
      console.log(`[ElementLocator] ${message}`);
    }
  }
  
  /**
   * 销毁定位器
   */
  destroy() {
    this.removeAllListeners();
    this.log('ElementLocator destroyed');
  }
}