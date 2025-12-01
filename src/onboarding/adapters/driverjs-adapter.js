// DriverJS适配器 - 将TypeScript的DriverJS功能转换为JavaScript并适配Onboarding系统

// 导入样式文件
import './driverjs-styles.css';

// 状态管理
let currentState = {};

function setState(key, value) {
  currentState[key] = value;
}

function getState(key) {
  return key ? currentState[key] : currentState;
}

function resetState() {
  currentState = {};
}

// 配置管理
let currentConfig = {
  animate: true,
  allowClose: true,
  overlayClickBehavior: 'close',
  overlayOpacity: 0.7,
  smoothScroll: false,
  disableActiveInteraction: false,
  showProgress: false,
  stagePadding: 10,
  stageRadius: 5,
  popoverOffset: 10,
  showButtons: ['next', 'previous', 'close'],
  disableButtons: [],
  overlayColor: '#000'
};

function configure(config = {}) {
  currentConfig = {
    ...currentConfig,
    ...config
  };
}

function getConfig(key) {
  return key ? currentConfig[key] : currentConfig;
}

// 事件发射器
let registeredListeners = {};

function listen(hook, callback) {
  registeredListeners[hook] = callback;
}

function emit(hook) {
  registeredListeners[hook]?.();
}

function destroyEmitter() {
  registeredListeners = {};
}

// 工具函数
function easeInOutQuad(elapsed, initialValue, amountOfChange, duration) {
  if ((elapsed /= duration / 2) < 1) {
    return (amountOfChange / 2) * elapsed * elapsed + initialValue;
  }
  return (-amountOfChange / 2) * (--elapsed * (elapsed - 2) - 1) + initialValue;
}

function getFocusableElements(parentEls) {
  const focusableQuery = 
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';

  return parentEls
    .flatMap(parentEl => {
      const isParentFocusable = parentEl.matches(focusableQuery);
      const focusableEls = Array.from(parentEl.querySelectorAll(focusableQuery));

      return [...(isParentFocusable ? [parentEl] : []), ...focusableEls];
    })
    .filter(el => {
      return getComputedStyle(el).pointerEvents !== 'none' && isElementVisible(el);
    });
}

function bringInView(element) {
  if (!element || isElementInView(element)) {
    return;
  }

  const shouldSmoothScroll = getConfig('smoothScroll');
  const isTallerThanViewport = element.offsetHeight > window.innerHeight;

  element.scrollIntoView({
    behavior: !shouldSmoothScroll || hasScrollableParent(element) ? 'auto' : 'smooth',
    inline: 'center',
    block: isTallerThanViewport ? 'start' : 'center'
  });
}

function hasScrollableParent(e) {
  if (!e || !e.parentElement) {
    return false;
  }

  const parent = e.parentElement;
  return parent.scrollHeight > parent.clientHeight;
}

function isElementInView(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function isElementVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// 遮罩层相关功能
function transitionStage(elapsed, duration, from, to) {
  let activeStagePosition = getState('__activeStagePosition');

  const fromDefinition = activeStagePosition ? activeStagePosition : from.getBoundingClientRect();
  const toDefinition = to.getBoundingClientRect();

  const x = easeInOutQuad(elapsed, fromDefinition.x, toDefinition.x - fromDefinition.x, duration);
  const y = easeInOutQuad(elapsed, fromDefinition.y, toDefinition.y - fromDefinition.y, duration);
  const width = easeInOutQuad(elapsed, fromDefinition.width, toDefinition.width - fromDefinition.width, duration);
  const height = easeInOutQuad(elapsed, fromDefinition.height, toDefinition.height - fromDefinition.height, duration);

  activeStagePosition = {
    x,
    y,
    width,
    height
  };

  renderOverlay(activeStagePosition);
  setState('__activeStagePosition', activeStagePosition);
}

function trackActiveElement(element) {
  if (!element) {
    return;
  }

  const definition = element.getBoundingClientRect();

  const activeStagePosition = {
    x: definition.x,
    y: definition.y,
    width: definition.width,
    height: definition.height
  };

  setState('__activeStagePosition', activeStagePosition);
  renderOverlay(activeStagePosition);
}

function refreshOverlay() {
  const activeStagePosition = getState('__activeStagePosition');
  const overlaySvg = getState('__overlaySvg');

  if (!activeStagePosition || !overlaySvg) {
    return;
  }

  const windowX = window.innerWidth;
  const windowY = window.innerHeight;

  overlaySvg.setAttribute('viewBox', `0 0 ${windowX} ${windowY}`);
}

function createOverlaySvg(stagePosition) {
  const { x, y, width, height } = stagePosition;
  const windowX = window.innerWidth;
  const windowY = window.innerHeight;
  const padding = getConfig('stagePadding') || 0;
  const radius = getConfig('stageRadius') || 0;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'fixed';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'auto';
  svg.style.zIndex = '9998';
  svg.style.overflow = 'visible';
  svg.setAttribute('viewBox', `0 0 ${windowX} ${windowY}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.appendChild(defs);

  const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
  mask.id = 'driver-mask';
  defs.appendChild(mask);

  const rectBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rectBg.setAttribute('width', '100%');
  rectBg.setAttribute('height', '100%');
  rectBg.setAttribute('fill', 'white');
  mask.appendChild(rectBg);

  const rectStage = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rectStage.setAttribute('x', (x - padding).toString());
  rectStage.setAttribute('y', (y - padding).toString());
  rectStage.setAttribute('width', (width + padding * 2).toString());
  rectStage.setAttribute('height', (height + padding * 2).toString());
  rectStage.setAttribute('rx', radius.toString());
  rectStage.setAttribute('fill', 'black');
  mask.appendChild(rectStage);

  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  overlay.setAttribute('width', '100%');
  overlay.setAttribute('height', '100%');
  overlay.setAttribute('fill', getConfig('overlayColor') || '#000');
  overlay.setAttribute('fill-opacity', getConfig('overlayOpacity').toString());
  overlay.setAttribute('mask', 'url(#driver-mask)');
  svg.appendChild(overlay);

  return svg;
}

function mountOverlay(stagePosition) {
  const overlaySvg = createOverlaySvg(stagePosition);
  document.body.appendChild(overlaySvg);

  overlaySvg.addEventListener('click', e => {
    const target = e.target;
    if (target.tagName !== 'path' && target.tagName !== 'rect') {
      return;
    }
    emit('overlayClick');
  });

  setState('__overlaySvg', overlaySvg);
}

function renderOverlay(stagePosition) {
  const overlaySvg = getState('__overlaySvg');

  if (!overlaySvg) {
    mountOverlay(stagePosition);
    return;
  }

  // 更新遮罩位置和大小
  const mask = overlaySvg.querySelector('#driver-mask rect:nth-child(2)');
  const padding = getConfig('stagePadding') || 0;
  const radius = getConfig('stageRadius') || 0;

  mask.setAttribute('x', (stagePosition.x - padding).toString());
  mask.setAttribute('y', (stagePosition.y - padding).toString());
  mask.setAttribute('width', (stagePosition.width + padding * 2).toString());
  mask.setAttribute('height', (stagePosition.height + padding * 2).toString());
  mask.setAttribute('rx', radius.toString());
}

// 高亮功能
function mountDummyElement() {
  const existingDummy = document.getElementById('driver-dummy-element');
  if (existingDummy) {
    return existingDummy;
  }

  let element = document.createElement('div');
  element.id = 'driver-dummy-element';
  element.style.width = '0';
  element.style.height = '0';
  element.style.pointerEvents = 'none';
  element.style.opacity = '0';
  element.style.position = 'fixed';
  element.style.top = '50%';
  element.style.left = '50%';

  document.body.appendChild(element);
  return element;
}

function highlight(step) {
  const { element } = step;
  let elemObj = typeof element === 'function' 
    ? element() 
    : typeof element === 'string' 
      ? document.querySelector(element) 
      : element;

  // 如果元素不存在，创建一个假元素
  if (!elemObj) {
    elemObj = mountDummyElement();
  }

  transferHighlight(elemObj, step);
}

function refreshActiveHighlight() {
  const activeHighlight = getState('__activeElement');
  const activeStep = getState('__activeStep');

  if (!activeHighlight) {
    return;
  }

  trackActiveElement(activeHighlight);
  refreshOverlay();
  repositionPopover(activeHighlight, activeStep);
}

function transferHighlight(toElement, toStep) {
  const duration = 400;
  const start = Date.now();

  const fromStep = getState('__activeStep');
  const fromElement = getState('__activeElement') || toElement;

  // 判断是否是第一次高亮
  const isFirstHighlight = !fromElement || fromElement === toElement;
  const isToDummyElement = toElement.id === 'driver-dummy-element';
  const isFromDummyElement = fromElement.id === 'driver-dummy-element';

  const isAnimatedTour = getConfig('animate');
  const highlightStartedHook = toStep.onHighlightStarted || getConfig('onHighlightStarted');
  const highlightedHook = toStep.onHighlighted || getConfig('onHighlighted');
  const deselectedHook = fromStep?.onDeselected || getConfig('onDeselected');

  const config = getConfig();
  const state = getState();

  if (!isFirstHighlight && deselectedHook) {
    deselectedHook(isFromDummyElement ? undefined : fromElement, fromStep, {
      config,
      state
    });
  }

  if (highlightStartedHook) {
    highlightStartedHook(isToDummyElement ? undefined : toElement, toStep, {
      config,
      state
    });
  }

  const hasDelayedPopover = !isFirstHighlight && isAnimatedTour;
  let isPopoverRendered = false;

  hidePopover();
  bringInView(toElement);

  setState('__previousElement', fromElement);
  setState('__previousStep', fromStep);
  setState('__activeElement', toElement);
  setState('__activeStep', toStep);

  // 设置元素高亮类
  if (toElement !== fromElement) {
    fromElement.classList.remove('driver-active-element', 'driver-no-interaction');
  }

  toElement.classList.add('driver-active-element');
  if (getConfig('disableActiveInteraction') || toStep.disableActiveInteraction) {
    toElement.classList.add('driver-no-interaction');
  }

  // 动画处理
  if (isAnimatedTour && !isFirstHighlight && fromElement !== toElement) {
    const animateHighlight = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        transitionStage(elapsed, duration, fromElement, toElement);
        requestAnimationFrame(animateHighlight);
      } else {
        trackActiveElement(toElement);
        renderPopover(toElement, toStep);
        isPopoverRendered = true;

        if (highlightedHook) {
          highlightedHook(isToDummyElement ? undefined : toElement, toStep, {
            config,
            state
          });
        }
      }
    };

    requestAnimationFrame(animateHighlight);
  } else {
    trackActiveElement(toElement);
    renderPopover(toElement, toStep);
    isPopoverRendered = true;

    if (highlightedHook) {
      highlightedHook(isToDummyElement ? undefined : toElement, toStep, {
        config,
        state
      });
    }
  }
}

function destroyHighlight() {
  document.getElementById('driver-dummy-element')?.remove();
  document.querySelectorAll('.driver-active-element').forEach(element => {
    element.classList.remove('driver-active-element', 'driver-no-interaction');
    element.removeAttribute('aria-haspopup');
    element.removeAttribute('aria-expanded');
    element.removeAttribute('aria-controls');
  });
}

// 弹出框相关功能
function createPopover() {
  const popoverWrapper = document.createElement('div');
  popoverWrapper.className = 'driver-popover';
  popoverWrapper.style.position = 'absolute';
  popoverWrapper.style.zIndex = '9999';
  popoverWrapper.style.display = 'none';

  const popoverArrow = document.createElement('div');
  popoverArrow.className = 'driver-popover-arrow';
  popoverWrapper.appendChild(popoverArrow);

  const popoverTitle = document.createElement('h3');
  popoverTitle.className = 'driver-popover-title';
  popoverWrapper.appendChild(popoverTitle);

  const popoverDescription = document.createElement('div');
  popoverDescription.className = 'driver-popover-description';
  popoverWrapper.appendChild(popoverDescription);

  const popoverFooter = document.createElement('div');
  popoverFooter.className = 'driver-popover-footer';
  popoverWrapper.appendChild(popoverFooter);

  const popoverProgress = document.createElement('div');
  popoverProgress.className = 'driver-popover-progress';
  popoverFooter.appendChild(popoverProgress);

  const popoverFooterButtons = document.createElement('div');
  popoverFooterButtons.className = 'driver-popover-footer-buttons';
  popoverFooter.appendChild(popoverFooterButtons);

  const previousButton = document.createElement('button');
  previousButton.className = 'driver-popover-btn driver-popover-prev-btn';
  previousButton.type = 'button';
  popoverFooterButtons.appendChild(previousButton);

  const nextButton = document.createElement('button');
  nextButton.className = 'driver-popover-btn driver-popover-next-btn';
  nextButton.type = 'button';
  popoverFooterButtons.appendChild(nextButton);

  const closeButton = document.createElement('button');
  closeButton.className = 'driver-popover-close-btn';
  closeButton.type = 'button';
  closeButton.innerHTML = '&times;';
  popoverWrapper.appendChild(closeButton);

  return {
    wrapper: popoverWrapper,
    arrow: popoverArrow,
    title: popoverTitle,
    description: popoverDescription,
    footer: popoverFooter,
    progress: popoverProgress,
    previousButton,
    nextButton,
    closeButton,
    footerButtons: popoverFooterButtons
  };
}

function hidePopover() {
  const popover = getState('popover');
  if (!popover) {
    return;
  }
  popover.wrapper.style.display = 'none';
}

function renderPopover(element, step) {
  let popover = getState('popover');
  if (popover) {
    document.body.removeChild(popover.wrapper);
  }

  popover = createPopover();
  document.body.appendChild(popover.wrapper);
  setState('popover', popover);

  const { title, description, showButtons, disableButtons, showProgress } = step.popover || {};

  popover.nextButton.innerHTML = step.popover?.nextBtnText || getConfig('nextBtnText') || 'Next &rarr;';
  popover.previousButton.innerHTML = step.popover?.prevBtnText || getConfig('prevBtnText') || '&larr; Previous';
  popover.progress.innerHTML = step.popover?.progressText || getConfig('progressText') || '{current} of {total}';

  if (title) {
    popover.title.innerHTML = title;
    popover.title.style.display = 'block';
  } else {
    popover.title.style.display = 'none';
  }

  if (description) {
    popover.description.innerHTML = description;
    popover.description.style.display = 'block';
  } else {
    popover.description.style.display = 'none';
  }

  // 设置按钮显示和禁用状态
  const showButtonsConfig = showButtons || getConfig('showButtons');
  const disableButtonsConfig = disableButtons || getConfig('disableButtons');

  popover.previousButton.style.display = showButtonsConfig.includes('previous') ? 'inline-block' : 'none';
  popover.nextButton.style.display = showButtonsConfig.includes('next') ? 'inline-block' : 'none';
  popover.closeButton.style.display = showButtonsConfig.includes('close') ? 'block' : 'none';

  popover.previousButton.disabled = disableButtonsConfig.includes('previous');
  popover.nextButton.disabled = disableButtonsConfig.includes('next');

  // 设置进度显示
  popover.progress.style.display = showProgress || getConfig('showProgress') ? 'block' : 'none';

  // 重新定位弹出框
  repositionPopover(element, step);

  // 绑定事件
  popover.nextButton.addEventListener('click', () => emit('nextClick'));
  popover.previousButton.addEventListener('click', () => emit('prevClick'));
  popover.closeButton.addEventListener('click', () => emit('closeClick'));

  // 显示弹出框
  popover.wrapper.style.display = 'block';
}

function repositionPopover(element, step) {
  const popover = getState('popover');
  if (!popover) {
    return;
  }

  const elementRect = element.getBoundingClientRect();
  const popoverRect = popover.wrapper.getBoundingClientRect();
  const popoverOffset = getConfig('popoverOffset') || 10;
  const side = step.popover?.side || 'bottom';

  let top, left;

  switch (side) {
    case 'top':
      top = elementRect.top - popoverRect.height - popoverOffset;
      left = elementRect.left + (elementRect.width / 2) - (popoverRect.width / 2);
      break;
    case 'right':
      top = elementRect.top + (elementRect.height / 2) - (popoverRect.height / 2);
      left = elementRect.right + popoverOffset;
      break;
    case 'left':
      top = elementRect.top + (elementRect.height / 2) - (popoverRect.height / 2);
      left = elementRect.left - popoverRect.width - popoverOffset;
      break;
    case 'bottom':
    default:
      top = elementRect.bottom + popoverOffset;
      left = elementRect.left + (elementRect.width / 2) - (popoverRect.width / 2);
  }

  // 调整位置以确保在视口内
  top = Math.max(0, top);
  left = Math.max(0, left);
  
  if (top + popoverRect.height > window.innerHeight) {
    top = window.innerHeight - popoverRect.height;
  }
  if (left + popoverRect.width > window.innerWidth) {
    left = window.innerWidth - popoverRect.width;
  }

  popover.wrapper.style.top = `${top}px`;
  popover.wrapper.style.left = `${left}px`;

  // 设置箭头位置
  popover.arrow.className = `driver-popover-arrow driver-popover-arrow--${side}`;
}

// 销毁功能
function destroyOverlay() {
  const overlaySvg = getState('__overlaySvg');
  if (overlaySvg) {
    document.body.removeChild(overlaySvg);
    setState('__overlaySvg', null);
  }
}

function destroyPopover() {
  const popover = getState('popover');
  if (popover) {
    document.body.removeChild(popover.wrapper);
    setState('popover', null);
  }
}

function destroyEvents() {
  // 清理事件监听器
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
}

function initEvents() {
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
}

function handleKeydown(event) {
  if (!getConfig('allowKeyboardControl')) {
    return;
  }

  switch (event.key) {
    case 'ArrowRight':
    case 'Enter':
      event.preventDefault();
      emit('arrowRightPress');
      emit('nextClick');
      break;
    case 'ArrowLeft':
      event.preventDefault();
      emit('arrowLeftPress');
      emit('prevClick');
      break;
    case 'Escape':
      if (getConfig('allowClose')) {
        event.preventDefault();
        emit('escapePress');
        emit('closeClick');
      }
      break;
    default:
      break;
  }
}

function handleResize() {
  refreshActiveHighlight();
}

function handleScroll() {
  refreshActiveHighlight();
}

// 适配器接口 - 供Onboarding系统使用
export const DriverJSAdapter = {
  // 初始化
  init(options) {
    configure(options);
    resetState();
    initEvents();
  },
  
  // 高亮元素
  highlightElement(stepConfig) {
    highlight(stepConfig);
  },
  
  // 更新高亮
  updateHighlight() {
    refreshActiveHighlight();
  },
  
  // 销毁所有内容
  destroy() {
    destroyHighlight();
    destroyPopover();
    destroyOverlay();
    destroyEvents();
    destroyEmitter();
    resetState();
  },
  
  // 事件监听
  on(event, callback) {
    listen(event, callback);
  },
  
  // 更新配置
  updateConfig(config) {
    configure(config);
  },
  
  // 获取状态
  getState,
  
  // 设置状态
  setState
};

export default DriverJSAdapter;