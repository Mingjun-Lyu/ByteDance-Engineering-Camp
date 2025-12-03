import { refreshOverlay, trackActiveElement, transitionStage } from "./overlay";
import { getConfig, getCurrentDriver } from "../utils/config";
import { hidePopover, renderPopover, repositionPopover } from "./popover";
import { bringInView } from "../utils/utils";
import { getState, setState } from "../utils/state";

// 挂载虚拟元素
function mountDummyElement() {
  const existingDummy = document.getElementById("driver-dummy-element");
  if (existingDummy) {
    return existingDummy;
  }

  let element = document.createElement("div");

  element.id = "driver-dummy-element";
  element.style.width = "0";
  element.style.height = "0";
  element.style.pointerEvents = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.top = "50%";
  element.style.left = "50%";

  document.body.appendChild(element);

  return element;
}


// 高亮显示指定步骤的元素
export function highlight(step) {
  const { element } = step;
  // 支持函数、选择器字符串或DOM元素
  let elemObj =
    typeof element === "function" ? element() : typeof element === "string" ? document.querySelector(element) : element;

  // 如果元素不存在，挂载虚拟元素用于显示模态式高亮
  if (!elemObj) {
    elemObj = mountDummyElement();
  }

  transferHighlight(elemObj, step);
}


// 刷新当前高亮显示
export function refreshActiveHighlight() {
  const activeHighlight = getState("__activeElement");
  const activeStep = getState("__activeStep");

  if (!activeHighlight) {
    return;
  }

  // 重新跟踪激活元素并更新遮罩和弹出框位置
  trackActiveElement(activeHighlight);
  refreshOverlay();
  repositionPopover(activeHighlight, activeStep);
}


// 高亮转移函数
function transferHighlight(toElement, toStep) {
  const duration = 400; // 动画持续时间
  const start = Date.now();

  const fromStep = getState("__activeStep");
  const fromElement = getState("__activeElement") || toElement;

  // 判断是否是第一次高亮、是否为虚拟元素
  const isFirstHighlight = !fromElement || fromElement === toElement;
  const isToDummyElement = toElement.id === "driver-dummy-element";
  const isFromDummyElement = fromElement.id === "driver-dummy-element";

  const isAnimatedTour = getConfig("animate");
  const highlightStartedHook = toStep.onHighlightStarted || getConfig("onHighlightStarted");
  const highlightedHook = toStep?.onHighlighted || getConfig("onHighlighted");
  const deselectedHook = fromStep?.onDeselected || getConfig("onDeselected");

  const config = getConfig();
  const state = getState();

  // 触发取消选择钩子
  if (!isFirstHighlight && deselectedHook) {
    deselectedHook(isFromDummyElement ? undefined : fromElement, fromStep, {
      config,
      state,
      driver: getCurrentDriver(),
    });
  }

  // 触发高亮开始钩子
  if (highlightStartedHook) {
    highlightStartedHook(isToDummyElement ? undefined : toElement, toStep, {
      config,
      state,
      driver: getCurrentDriver(),
    });
  }

  // 判断是否延迟显示弹出框
  const hasDelayedPopover = !isFirstHighlight && isAnimatedTour;
  let isPopoverRendered = false;

  hidePopover();

  // 更新状态
  setState("previousStep", fromStep);
  setState("previousElement", fromElement);
  setState("activeStep", toStep);
  setState("activeElement", toElement);

  // 动画循环函数
  const animate = () => {
    const transitionCallback = getState("__transitionCallback");

    // 确保多次调用transferHighlight不会互相干扰，只有最后一次调用会被执行
    if (transitionCallback !== animate) {
      return;
    }

    const elapsed = Date.now() - start;
    const timeRemaining = duration - elapsed;
    const isHalfwayThrough = timeRemaining <= duration / 2;

    // 动画进行到一半时渲染弹出框
    if (toStep.popover && isHalfwayThrough && !isPopoverRendered && hasDelayedPopover) {
      renderPopover(toElement, toStep);
      isPopoverRendered = true;
    }

    // 执行动画过渡
    if (getConfig("animate") && elapsed < duration) {
      transitionStage(elapsed, duration, fromElement, toElement);
    } else {
      // 动画完成后的处理
      trackActiveElement(toElement);

      // 触发高亮完成钩子
      if (highlightedHook) {
        highlightedHook(isToDummyElement ? undefined : toElement, toStep, {
          config: getConfig(),
          state: getState(),
          driver: getCurrentDriver(),
        });
      }

      // 清理过渡状态
      setState("__transitionCallback", undefined);
      setState("__previousStep", fromStep);
      setState("__previousElement", fromElement);
      setState("__activeStep", toStep);
      setState("__activeElement", toElement);
    }

    window.requestAnimationFrame(animate);
  };

  setState("__transitionCallback", animate);

  window.requestAnimationFrame(animate);

  // 确保目标元素在可视区域内
  bringInView(toElement);
  
  // 如果没有延迟显示，立即渲染弹出框
  if (!hasDelayedPopover && toStep.popover) {
    renderPopover(toElement, toStep);
  }

  // 清理上一个元素的样式和属性
  fromElement.classList.remove("driver-active-element", "driver-no-interaction");
  fromElement.removeAttribute("aria-haspopup");
  fromElement.removeAttribute("aria-expanded");
  fromElement.removeAttribute("aria-controls");

  // 为目标元素添加样式和属性
  const disableActiveInteraction = toStep.disableActiveInteraction ?? getConfig("disableActiveInteraction");
  if (disableActiveInteraction) {
    toElement.classList.add("driver-no-interaction");
  }

  toElement.classList.add("driver-active-element");
  toElement.setAttribute("aria-haspopup", "dialog");
  toElement.setAttribute("aria-expanded", "true");
  toElement.setAttribute("aria-controls", "driver-popover-content");
}

// 销毁高亮显示
export function destroyHighlight() {
  // 移除虚拟元素
  document.getElementById("driver-dummy-element")?.remove();
  
  // 清理所有高亮元素的样式和属性
  document.querySelectorAll(".driver-active-element").forEach(element => {
    element.classList.remove("driver-active-element", "driver-no-interaction");
    element.removeAttribute("aria-haspopup");
    element.removeAttribute("aria-expanded");
    element.removeAttribute("aria-controls");
  });
}