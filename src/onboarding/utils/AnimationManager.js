import { EventEmitter } from './EventEmitter.js';

/**
 * 动画管理器类
 * 负责处理步骤间的过渡动画和元素高亮效果
 */
export class AnimationManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // 配置选项
    this.options = {
      duration: 300,
      easing: 'ease-in-out',
      transitionDelay: 100,
      enableFade: true,
      enableSlide: false,
      enableScale: false,
      enableHighlight: true,
      highlightColor: '#ffeb3b',
      highlightOpacity: 0.3,
      ...options
    };
    
    // 动画状态
    this.isAnimating = false;
    this.currentAnimation = null;
    this.animationQueue = [];
    
    // 动画元素缓存
    this.animationElements = new Map();
    
    // 样式表
    this.styleSheet = null;
    this.createStyles();
  }
  
  /**
   * 创建动画样式
   */
  createStyles() {
    if (typeof document === 'undefined') return;
    
    // 创建或获取样式表
    const styleId = 'onboarding-animation-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    const styles = `
      .onboarding-highlight {
        position: relative;
        z-index: 10000;
        transition: all ${this.options.duration}ms ${this.options.easing} !important;
      }
      
      .onboarding-highlight::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background-color: ${this.options.highlightColor};
        opacity: ${this.options.highlightOpacity};
        border-radius: 4px;
        z-index: -1;
        animation: pulse 2s infinite;
      }
      
      .onboarding-fade-in {
        animation: fadeIn ${this.options.duration}ms ${this.options.easing};
      }
      
      .onboarding-fade-out {
        animation: fadeOut ${this.options.duration}ms ${this.options.easing};
      }
      
      .onboarding-slide-in {
        animation: slideIn ${this.options.duration}ms ${this.options.easing};
      }
      
      .onboarding-slide-out {
        animation: slideOut ${this.options.duration}ms ${this.options.easing};
      }
      
      @keyframes pulse {
        0% { opacity: ${this.options.highlightOpacity}; }
        50% { opacity: ${this.options.highlightOpacity * 0.6}; }
        100% { opacity: ${this.options.highlightOpacity}; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideIn {
        from { 
          transform: translateX(20px);
          opacity: 0;
        }
        to { 
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from { 
          transform: translateX(0);
          opacity: 1;
        }
        to { 
          transform: translateX(-20px);
          opacity: 0;
        }
      }
    `;
    
    styleElement.textContent = styles;
    this.styleSheet = styleElement;
  }
  
  /**
   * 高亮目标元素
   * @param {HTMLElement} element - 目标元素
   * @param {Object} options - 高亮选项
   */
  async highlightElement(element, options = {}) {
    if (!element || typeof document === 'undefined') return;
    
    const highlightOptions = {
      duration: this.options.duration,
      color: this.options.highlightColor,
      opacity: this.options.highlightOpacity,
      pulse: true,
      ...options
    };
    
    // 保存原始样式
    const originalStyles = {
      position: element.style.position,
      zIndex: element.style.zIndex,
      transition: element.style.transition
    };
    
    // 应用高亮样式
    element.classList.add('onboarding-highlight');
    
    // 触发高亮开始事件
    this.emit('highlightStarted', { element, options: highlightOptions });
    
    // 等待动画完成
    await this.wait(highlightOptions.duration);
    
    // 触发高亮完成事件
    this.emit('highlightCompleted', { element, options: highlightOptions });
    
    return () => {
      // 清理高亮样式
      element.classList.remove('onboarding-highlight');
      
      // 恢复原始样式
      Object.keys(originalStyles).forEach(key => {
        if (originalStyles[key]) {
          element.style[key] = originalStyles[key];
        }
      });
    };
  }
  
  /**
   * 淡入动画
   * @param {HTMLElement} element - 目标元素
   * @param {Object} options - 动画选项
   */
  async fadeIn(element, options = {}) {
    if (!element || typeof document === 'undefined') return;
    
    const fadeOptions = {
      duration: this.options.duration,
      ...options
    };
    
    // 设置初始状态
    element.style.opacity = '0';
    element.style.display = 'block';
    
    // 应用淡入动画
    element.classList.add('onboarding-fade-in');
    
    this.emit('fadeInStarted', { element, options: fadeOptions });
    
    await this.wait(fadeOptions.duration);
    
    this.emit('fadeInCompleted', { element, options: fadeOptions });
    
    // 清理动画类
    element.classList.remove('onboarding-fade-in');
    element.style.opacity = '';
  }
  
  /**
   * 淡出动画
   * @param {HTMLElement} element - 目标元素
   * @param {Object} options - 动画选项
   */
  async fadeOut(element, options = {}) {
    if (!element || typeof document === 'undefined') return;
    
    const fadeOptions = {
      duration: this.options.duration,
      ...options
    };
    
    // 应用淡出动画
    element.classList.add('onboarding-fade-out');
    
    this.emit('fadeOutStarted', { element, options: fadeOptions });
    
    await this.wait(fadeOptions.duration);
    
    this.emit('fadeOutCompleted', { element, options: fadeOptions });
    
    // 清理动画类并隐藏元素
    element.classList.remove('onboarding-fade-out');
    element.style.display = 'none';
  }
  
  /**
   * 滑入动画
   * @param {HTMLElement} element - 目标元素
   * @param {Object} options - 动画选项
   */
  async slideIn(element, options = {}) {
    if (!element || typeof document === 'undefined') return;
    
    const slideOptions = {
      duration: this.options.duration,
      direction: 'right',
      ...options
    };
    
    // 设置初始状态
    element.style.opacity = '0';
    element.style.display = 'block';
    
    // 应用滑入动画
    element.classList.add('onboarding-slide-in');
    
    this.emit('slideInStarted', { element, options: slideOptions });
    
    await this.wait(slideOptions.duration);
    
    this.emit('slideInCompleted', { element, options: slideOptions });
    
    // 清理动画类
    element.classList.remove('onboarding-slide-in');
    element.style.opacity = '';
  }
  
  /**
   * 滑出动画
   * @param {HTMLElement} _element - 目标元素
   * @param {Object} options - 动画选项
   */
  async slideOut(_element, options = {}) {
    if (!_element || typeof document === 'undefined') return;
    
    const slideOptions = {
      duration: this.options.duration,
      direction: 'left',
      ...options
    };
    
    // 应用滑出动画
    _element.classList.add('onboarding-slide-out');
    
    this.emit('slideOutStarted', { element: _element, options: slideOptions });
    
    await this.wait(slideOptions.duration);
    
    this.emit('slideOutCompleted', { element: _element, options: slideOptions });
    
    // 清理动画类并隐藏元素
    _element.classList.remove('onboarding-slide-out');
    _element.style.display = 'none';
  }
  
  /**
   * 步骤过渡动画
   * @param {Object} fromStep - 离开的步骤
   * @param {Object} toStep - 进入的步骤
   * @param {Object} options - 动画选项
   */
  async transitionSteps(fromStep, toStep, options = {}) {
    if (this.isAnimating) {
      // 如果正在动画，加入队列
      return new Promise((resolve) => {
        this.animationQueue.push(() => this.transitionSteps(fromStep, toStep, options).then(resolve));
      });
    }
    
    this.isAnimating = true;
    
    try {
      const transitionOptions = {
        type: 'fade', // fade, slide, crossfade
        duration: this.options.duration,
        delay: this.options.transitionDelay,
        ...options
      };
      
      this.emit('transitionStarted', { fromStep, toStep, options: transitionOptions });
      
      // 根据过渡类型执行不同的动画
      switch (transitionOptions.type) {
        case 'fade':
          await this.fadeTransition(fromStep, toStep, transitionOptions);
          break;
        case 'slide':
          await this.slideTransition(fromStep, toStep, transitionOptions);
          break;
        case 'crossfade':
          await this.crossfadeTransition(fromStep, toStep, transitionOptions);
          break;
        default:
          await this.fadeTransition(fromStep, toStep, transitionOptions);
      }
      
      this.emit('transitionCompleted', { fromStep, toStep, options: transitionOptions });
      
    } finally {
      this.isAnimating = false;
      
      // 处理队列中的下一个动画
      if (this.animationQueue.length > 0) {
        const nextAnimation = this.animationQueue.shift();
        nextAnimation();
      }
    }
  }
  
  /**
   * 淡入淡出过渡
   */
  async fadeTransition(fromStep, toStep, options) {
    // 淡出当前步骤
    if (fromStep && fromStep.targetElement) {
      await this.fadeOut(fromStep.targetElement, options);
    }
    
    // 等待过渡延迟
    if (options.delay > 0) {
      await this.wait(options.delay);
    }
    
    // 淡入新步骤
    if (toStep && toStep.targetElement) {
      await this.fadeIn(toStep.targetElement, options);
    }
  }
  
  /**
   * 滑动过渡
   */
  async slideTransition(fromStep, toStep, options) {
    // 滑出当前步骤
    if (fromStep && fromStep.targetElement) {
      await this.slideOut(fromStep.targetElement, options);
    }
    
    // 等待过渡延迟
    if (options.delay > 0) {
      await this.wait(options.delay);
    }
    
    // 滑入新步骤
    if (toStep && toStep.targetElement) {
      await this.slideIn(toStep.targetElement, options);
    }
  }
  
  /**
   * 交叉淡入淡出过渡
   */
  async crossfadeTransition(fromStep, toStep, options) {
    // 同时淡出当前步骤和淡入新步骤
    const promises = [];
    
    if (fromStep && fromStep.targetElement) {
      promises.push(this.fadeOut(fromStep.targetElement, options));
    }
    
    if (toStep && toStep.targetElement) {
      promises.push(this.fadeIn(toStep.targetElement, options));
    }
    
    await Promise.all(promises);
  }
  
  /**
   * 等待指定时间
   * @param {number} ms - 等待时间（毫秒）
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 暂停所有动画
   */
  pause() {
    if (this.currentAnimation) {
      // 暂停当前动画（简化实现）
      this.emit('animationPaused');
    }
  }
  
  /**
   * 恢复所有动画
   */
  resume() {
    if (this.currentAnimation) {
      // 恢复当前动画（简化实现）
      this.emit('animationResumed');
    }
  }
  
  /**
   * 重置动画状态
   */
  reset() {
    this.isAnimating = false;
    this.currentAnimation = null;
    this.animationQueue = [];
    
    // 清理所有动画元素
    this.animationElements.forEach((cleanup) => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    });
    this.animationElements.clear();
    
    this.emit('animationReset');
  }
  
  /**
   * 销毁动画管理器
   */
  destroy() {
    this.reset();
    
    // 移除样式表
    if (this.styleSheet && this.styleSheet.parentNode) {
      this.styleSheet.parentNode.removeChild(this.styleSheet);
    }
    
    this.emit('animationDestroyed');
  }
}