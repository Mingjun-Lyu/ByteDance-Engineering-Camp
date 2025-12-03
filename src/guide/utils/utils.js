import { getConfig } from "./config.js";

// 二次缓动函数（ease-in-out）
export function easeInOutQuad(elapsed, initialValue, amountOfChange, duration) {
  if ((elapsed /= duration / 2) < 1) {
    return (amountOfChange / 2) * elapsed * elapsed + initialValue;
  }
  return (-amountOfChange / 2) * (--elapsed * (elapsed - 2) - 1) + initialValue;
}

// 获取可聚焦元素
export function getFocusableElements(parentEls) {
  // 可聚焦元素的选择器
  const focusableQuery =
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';

  return parentEls
    .flatMap(parentEl => {
      // 检查父元素本身是否可聚焦
      const isParentFocusable = parentEl.matches(focusableQuery);
      // 获取父元素内所有可聚焦的子元素
      const focusableEls = Array.from(parentEl.querySelectorAll(focusableQuery));

      // 返回父元素（如果可聚焦）和所有可聚焦子元素
      return [...(isParentFocusable ? [parentEl] : []), ...focusableEls];
    })
    .filter(el => {
      // 过滤掉指针事件为none且不可见的元素
      return getComputedStyle(el).pointerEvents !== "none" && isElementVisible(el);
    });
}

// 将元素滚动到视图中
export function bringInView(element) {
  // 如果元素不存在或已在视图中，直接返回
  if (!element || isElementInView(element)) {
    return;
  }

  // 获取平滑滚动配置
  const shouldSmoothScroll = getConfig("smoothScroll");

  // 检查元素是否比视口高
  const isTallerThanViewport = element.offsetHeight > window.innerHeight;

  // 执行滚动操作
  element.scrollIntoView({
    // 如果禁用平滑滚动或元素有可滚动的父元素，使用自动滚动
    // 避免在可滚动父元素中使用平滑滚动导致高亮渲染问题
    behavior: !shouldSmoothScroll || hasScrollableParent(element) ? "auto" : "smooth",
    // 水平方向居中
    inline: "center",
    // 垂直方向：如果元素比视口高，则顶部对齐，否则居中
    block: isTallerThanViewport ? "start" : "center",
  });
}

// 检查元素是否有可滚动的父元素
export function hasScrollableParent(e) {
  if (!e || !e.parentElement) {
    return;
  }

  const parent = e.parentElement;

  // 如果父元素的滚动高度大于可视高度，说明有滚动条
  return parent.scrollHeight > parent.clientHeight;
}

// 检查元素是否在视图中
export function isElementInView(element) {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 检查元素是否可见
export function isElementVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}