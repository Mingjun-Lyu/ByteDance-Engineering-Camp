import { ElementLocator } from '../utils/ElementLocator.js';

/**
 * @jest-environment jsdom
 */

describe('ElementLocator', () => {
  let locator;
  let testContainer;
  
  beforeEach(() => {
    // 创建测试容器
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
    
    // 创建测试元素
    const testElement = document.createElement('button');
    testElement.id = 'test-button';
    testElement.className = 'test-class';
    testElement.setAttribute('data-onboarding', 'test-step');
    testElement.textContent = 'Test Button';
    
    // 确保元素有实际尺寸，使用offsetWidth/offsetHeight可以工作的方式
    testElement.style.width = '100px';
    testElement.style.height = '40px';
    testElement.style.display = 'inline-block'; // 确保尺寸生效
    testElement.style.position = 'absolute';
    testElement.style.top = '0';
    testElement.style.left = '0';
    testElement.style.opacity = '1';
    testElement.style.pointerEvents = 'auto';
    testElement.disabled = false;
    
    // 强制触发布局计算
    testContainer.appendChild(testElement);
    
    // 在测试环境中，确保getBoundingClientRect返回正确值
    if (typeof testElement.getBoundingClientRect === 'function') {
      const rect = testElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        // 如果尺寸为0，手动设置一个mock的getBoundingClientRect
        testElement.getBoundingClientRect = () => ({
          width: 100,
          height: 40,
          top: 0,
          left: 0,
          right: 100,
          bottom: 40,
          x: 0,
          y: 0
        });
      }
    }
    
    // 创建隐藏元素
    const hiddenElement = document.createElement('div');
    hiddenElement.id = 'hidden-element';
    hiddenElement.style.display = 'none';
    testContainer.appendChild(hiddenElement);
    
    // 创建禁用元素
    const disabledElement = document.createElement('input');
    disabledElement.id = 'disabled-input';
    disabledElement.disabled = true;
    testContainer.appendChild(disabledElement);
    
    // 创建小尺寸元素
    const smallElement = document.createElement('span');
    smallElement.id = 'small-element';
    smallElement.style.width = '0px';
    smallElement.style.height = '0px';
    testContainer.appendChild(smallElement);
    
    locator = new ElementLocator({
      debug: false,
      retry: {
        maxAttempts: 1, // 测试时减少重试次数
        delay: 10,
        timeout: 100
      },
      stateCheck: {
        checkVisibility: false, // 测试时禁用可见性检查
        checkInteractivity: false, // 测试时禁用可交互性检查
        checkDimensions: false // 测试时禁用尺寸检查
      }
    });
  });
  
  afterEach(() => {
    // 清理测试容器
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
    
    if (locator) {
      locator.destroy();
    }
  });
  
  describe('Initialization', () => {
    test('should initialize with default options', () => {
      const defaultLocator = new ElementLocator();
      expect(defaultLocator).toBeDefined();
      expect(defaultLocator.options.strategies).toEqual(['css', 'dataAttr', 'xpath']);
      expect(defaultLocator.options.retry.maxAttempts).toBe(3);
    });
    
    test('should accept custom options', () => {
      const customLocator = new ElementLocator({
        strategies: ['css'],
        debug: true
      });
      
      expect(customLocator.options.strategies).toEqual(['css']);
      expect(customLocator.options.debug).toBe(true);
    });
  });
  
  describe('CSS Selector Locating', () => {
    test('should locate element by ID selector', async () => {
      const element = await locator.locate({
        selector: '#test-button'
      });
      
      expect(element).toBeDefined();
      expect(element.id).toBe('test-button');
    });
    
    test('should locate element by class selector', async () => {
      const element = await locator.locate({
        selector: '.test-class'
      });
      
      expect(element).toBeDefined();
      expect(element.className).toBe('test-class');
    });
    
    test('should throw error for invalid CSS selector', async () => {
      await expect(locator.locate({
        selector: 'invalid[selector'
      })).rejects.toThrow();
    });
    
    test('should throw error for non-existent element', async () => {
      await expect(locator.locate({
        selector: '#non-existent'
      })).rejects.toThrow();
    });
  });
  
  describe('Data Attribute Locating', () => {
    test('should locate element by data-onboarding attribute', async () => {
      const element = await locator.locate({
        dataAttr: 'test-step'
      });
      
      expect(element).toBeDefined();
      expect(element.getAttribute('data-onboarding')).toBe('test-step');
    });
    
    test('should throw error for non-existent data attribute', async () => {
      await expect(locator.locate({
        dataAttr: 'non-existent'
      })).rejects.toThrow();
    });
    
    test('should support custom context', async () => {
      const context = document.createElement('div');
      const childElement = document.createElement('button');
      childElement.setAttribute('data-onboarding', 'child-step');
      context.appendChild(childElement);
      
      const element = await locator.locate({
        dataAttr: 'child-step',
        context: context
      });
      
      expect(element).toBeDefined();
      expect(element.getAttribute('data-onboarding')).toBe('child-step');
    });
  });
  
  describe('XPath Locating', () => {
    test('should locate element by XPath', async () => {
      const element = await locator.locate({
        xpath: '//button[@id="test-button"]'
      });
      
      expect(element).toBeDefined();
      expect(element.id).toBe('test-button');
    });
    
    test('should throw error for invalid XPath', async () => {
      await expect(locator.locate({
        xpath: 'invalid[xpath'
      })).rejects.toThrow();
    });
  });
  
  describe('Strategy Priority', () => {
    test('should try strategies in priority order', async () => {
      // 创建多个匹配的元素
      const cssElement = document.createElement('div');
      cssElement.className = 'priority-test';
      testContainer.appendChild(cssElement);
      
      const dataElement = document.createElement('div');
      dataElement.setAttribute('data-onboarding', 'priority-test');
      testContainer.appendChild(dataElement);
      
      // 应该优先使用CSS选择器
      const element = await locator.locate({
        selector: '.priority-test',
        dataAttr: 'priority-test'
      });
      
      expect(element).toBeDefined();
      expect(element.className).toBe('priority-test');
    });
  });
  
  describe('Element State Validation', () => {
    test('should reject hidden element', async () => {
      const stateCheckLocator = new ElementLocator({
        stateCheck: {
          checkVisibility: true,
          checkInteractivity: false,
          checkDimensions: false
        }
      });
      
      await expect(stateCheckLocator.locate({
        selector: '#hidden-element'
      })).rejects.toThrow();
      
      stateCheckLocator.destroy();
    });
    
    test('should reject disabled element', async () => {
      const stateCheckLocator = new ElementLocator({
        stateCheck: {
          checkVisibility: false,
          checkInteractivity: true,
          checkDimensions: false
        }
      });
      
      await expect(stateCheckLocator.locate({
        selector: '#disabled-input'
      })).rejects.toThrow();
      
      stateCheckLocator.destroy();
    });
    
    test('should reject zero-sized element', async () => {
      const stateCheckLocator = new ElementLocator({
        stateCheck: {
          checkVisibility: false,
          checkInteractivity: false,
          checkDimensions: true,
          minWidth: 1,
          minHeight: 1
        }
      });
      
      await expect(stateCheckLocator.locate({
        selector: '#small-element'
      })).rejects.toThrow();
      
      stateCheckLocator.destroy();
    });
    
    test('should accept valid element', async () => {
      const stateCheckLocator = new ElementLocator({
        debug: true,
        stateCheck: {
          checkVisibility: true,
          checkInteractivity: true,
          checkDimensions: true,
          minWidth: 1,
          minHeight: 1
        }
      });
      
      const element = await stateCheckLocator.locate({
        selector: '#test-button'
      });
      
      expect(element).toBeDefined();
      expect(element.id).toBe('test-button');
      
      stateCheckLocator.destroy();
    });
  });
  
  describe('Retry Mechanism', () => {
    test('should retry on failure', async () => {
      const retryLocator = new ElementLocator({
        retry: {
          maxAttempts: 5,
          delay: 20,
          timeout: 2000
        },
        stateCheck: {
          checkVisibility: false,
          checkInteractivity: false,
          checkDimensions: false
        },
        debug: true
      });
      
      // 动态添加元素，测试重试机制
      setTimeout(() => {
        const dynamicElement = document.createElement('div');
        dynamicElement.id = 'dynamic-element';
        dynamicElement.style.width = '100px';
        dynamicElement.style.height = '40px';
        dynamicElement.style.display = 'inline-block';
        testContainer.appendChild(dynamicElement);
        console.log('Dynamic element added to DOM');
      }, 100);
      
      const element = await retryLocator.locate({
        selector: '#dynamic-element',
        timeout: 1500
      });
      
      expect(element).toBeDefined();
      expect(element.id).toBe('dynamic-element');
      
      retryLocator.destroy();
    });
    
    test('should timeout after max attempts', async () => {
      await expect(locator.locate({
        selector: '#non-existent-element'
      })).rejects.toThrow('Failed to locate element');
    });
  });
  
  describe('Multiple Element Locating', () => {
    test('should locate multiple elements', async () => {
      // 添加第二个测试元素
      const secondElement = document.createElement('button');
      secondElement.id = 'second-button';
      secondElement.className = 'test-class';
      testContainer.appendChild(secondElement);
      
      const results = await locator.locateMultiple([
        { selector: '#test-button' },
        { selector: '#second-button' },
        { selector: '#non-existent' }
      ]);
      
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(false);
      expect(results[2].error).toBeDefined();
    });
    
    test('should throw error for invalid configs', async () => {
      await expect(locator.locateMultiple('invalid')).rejects.toThrow();
    });
  });
  
  describe('Wait For Element', () => {
    test('should wait for element to appear', async () => {
      // 延迟添加元素
      setTimeout(() => {
        const delayedElement = document.createElement('div');
        delayedElement.id = 'delayed-element';
        testContainer.appendChild(delayedElement);
      }, 50);
      
      const element = await locator.waitForElement({
        selector: '#delayed-element'
      }, 200);
      
      expect(element).toBeDefined();
      expect(element.id).toBe('delayed-element');
    });
    
    test('should timeout if element never appears', async () => {
      await expect(locator.waitForElement({
        selector: '#never-appears'
      }, 100)).rejects.toThrow('Timeout');
    });
  });
  
  describe('Event System', () => {
    test('should emit elementLocated event', async () => {
      const mockHandler = jest.fn();
      locator.on('elementLocated', mockHandler);
      
      await locator.locate({
        selector: '#test-button'
      });
      
      expect(mockHandler).toHaveBeenCalled();
      expect(mockHandler.mock.calls[0][0].element.id).toBe('test-button');
    });
    
    test('should emit locatorFailed event', async () => {
      const mockHandler = jest.fn();
      locator.on('locatorFailed', mockHandler);
      
      try {
        await locator.locate({
          selector: '#non-existent'
        });
      } catch {
        // 预期会抛出错误
      }
      
      expect(mockHandler).toHaveBeenCalled();
      expect(mockHandler.mock.calls[0][0].config.selector).toBe('#non-existent');
    });
  });
  
  describe('Error Handling', () => {
    test('should throw error for empty config', async () => {
      await expect(locator.locate({})).rejects.toThrow('Locator config is required');
    });
    
    test('should throw error for null config', async () => {
      await expect(locator.locate(null)).rejects.toThrow('Locator config is required');
    });
  });
});