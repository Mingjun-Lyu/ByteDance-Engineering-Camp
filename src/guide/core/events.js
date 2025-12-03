import { refreshActiveHighlight } from "./highlight";
import { emit } from "../utils/emitter";
import { getState, setState } from "../utils/state";
import { getConfig } from "../utils/config";
import { getFocusableElements } from "../utils/utils";


// 请求刷新当前高亮显示
export function requireRefresh() {
  const resizeTimeout = getState("__resizeTimeout");
  if (resizeTimeout) {
    window.cancelAnimationFrame(resizeTimeout);
  }

  // 使用requestAnimationFrame优化性能
  setState("__resizeTimeout", window.requestAnimationFrame(refreshActiveHighlight));
}

// 焦点陷阱函数
function trapFocus(e) {
  const isActivated = getState("isInitialized");
  if (!isActivated) {
    return;
  }

  const isTabKey = e.key === "Tab" || e.keyCode === 9;
  if (!isTabKey) {
    return;
  }

  const activeElement = getState("__activeElement");
  const popoverEl = getState("popover")?.wrapper;

  // 获取所有可聚焦元素
  const focusableEls = getFocusableElements([
    ...(popoverEl ? [popoverEl] : []),
    ...(activeElement ? [activeElement] : []),
  ]);

  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];

  e.preventDefault();

  // 处理Shift+Tab（向前导航）和Tab（向后导航）
  if (e.shiftKey) {
    const previousFocusableEl =
      focusableEls[focusableEls.indexOf(document.activeElement) - 1] || lastFocusableEl;
    previousFocusableEl?.focus();
  } else {
    const nextFocusableEl =
      focusableEls[focusableEls.indexOf(document.activeElement) + 1] || firstFocusableEl;
    nextFocusableEl?.focus();
  }
}

// 键盘按键释放事件处理
function onKeyup(e) {
  const allowKeyboardControl = getConfig("allowKeyboardControl") ?? true;

  if (!allowKeyboardControl) {
    return;
  }

  // 处理不同按键事件
  if (e.key === "Escape") {
    emit("escapePress");
  } else if (e.key === "ArrowRight") {
    emit("arrowRightPress");
  } else if (e.key === "ArrowLeft") {
    emit("arrowLeftPress");
  }
}

// 为引导元素添加点击事件监听
export function onDriverClick(
  element,
  listener,
  shouldPreventDefault
) {
  const listenerWrapper = (e, listener) => {
    const target = e.target;
    if (!element.contains(target)) {
      return;
    }

    // 如果需要阻止默认行为，则阻止事件传播
    if (!shouldPreventDefault || shouldPreventDefault(target)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    listener?.(e);
  };

  // 使用捕获阶段确保最先处理事件
  const useCapture = true;

  // 禁用相关事件
  document.addEventListener("pointerdown", listenerWrapper, useCapture);
  document.addEventListener("mousedown", listenerWrapper, useCapture);
  document.addEventListener("pointerup", listenerWrapper, useCapture);
  document.addEventListener("mouseup", listenerWrapper, useCapture);

  // 实际点击事件处理
  document.addEventListener(
    "click",
    e => {
      listenerWrapper(e, listener);
    },
    useCapture
  );
}

// 初始化事件监听
export function initEvents() {
  window.addEventListener("keyup", onKeyup, false);
  window.addEventListener("keydown", trapFocus, false);
  window.addEventListener("resize", requireRefresh);
  window.addEventListener("scroll", requireRefresh);
}

// 销毁事件监听
export function destroyEvents() {
  window.removeEventListener("keyup", onKeyup);
  window.removeEventListener("resize", requireRefresh);
  window.removeEventListener("scroll", requireRefresh);
}