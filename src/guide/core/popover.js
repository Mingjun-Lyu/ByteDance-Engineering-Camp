import { getConfig, getCurrentDriver } from "../utils/config";
import { emit } from "../utils/emitter";
import { onDriverClick } from "./events";
import { getState, setState } from "../utils/state";
import { bringInView, getFocusableElements } from "../utils/utils";

// 隐藏弹出框
export function hidePopover() {
  const popover = getState("popover");
  if (!popover) {
    return;
  }

  popover.wrapper.style.display = "none";
}

// 渲染弹出框
export function renderPopover(element, step) {
  let popover = getState("popover");
  if (popover) {
    document.body.removeChild(popover.wrapper);
  }

  // 创建新的弹出框
  popover = createPopover();
  document.body.appendChild(popover.wrapper);

  // 从步骤配置中获取弹出框参数
  const {
    title,
    description,
    showButtons,
    disableButtons,
    showProgress,

    nextBtnText = getConfig("nextBtnText") || "下一步 &rarr;",
    prevBtnText = getConfig("prevBtnText") || "&larr; 上一步",
    progressText = getConfig("progressText") || "第{current}步，共{total}步",
  } = step.popover || {};

  // 设置按钮文本
  popover.nextButton.innerHTML = nextBtnText;
  popover.previousButton.innerHTML = prevBtnText;
  popover.progress.innerHTML = progressText;

  // 设置标题
  if (title) {
    popover.title.innerHTML = title;
    popover.title.style.display = "block";
  } else {
    popover.title.style.display = "none";
  }

  // 设置描述
  if (description) {
    popover.description.innerHTML = description;
    popover.description.style.display = "block";
  } else {
    popover.description.style.display = "none";
  }

  // 配置按钮和进度显示
  const showButtonsConfig = showButtons || getConfig("showButtons");
  const showProgressConfig = showProgress || getConfig("showProgress") || false;
  const showFooter =
    showButtonsConfig?.includes("next") || showButtonsConfig?.includes("previous") || showProgressConfig;

  // 设置关闭按钮显示
  popover.closeButton.style.display = showButtonsConfig.includes("close") ? "block" : "none";

  // 设置底部区域显示
  if (showFooter) {
    popover.footer.style.display = "flex";

    popover.progress.style.display = showProgressConfig ? "block" : "none";
    popover.nextButton.style.display = showButtonsConfig.includes("next") ? "block" : "none";
    popover.previousButton.style.display = showButtonsConfig.includes("previous") ? "block" : "none";
  } else {
    popover.footer.style.display = "none";
  }

  // 设置禁用按钮
  const disabledButtonsConfig = disableButtons || getConfig("disableButtons") || [];
  if (disabledButtonsConfig?.includes("next")) {
    popover.nextButton.disabled = true;
    popover.nextButton.classList.add("driver-popover-btn-disabled");
  }

  if (disabledButtonsConfig?.includes("previous")) {
    popover.previousButton.disabled = true;
    popover.previousButton.classList.add("driver-popover-btn-disabled");
  }

  if (disabledButtonsConfig?.includes("close")) {
    popover.closeButton.disabled = true;
    popover.closeButton.classList.add("driver-popover-btn-disabled");
  }

  // 重置弹出框位置
  const popoverWrapper = popover.wrapper;
  popoverWrapper.style.display = "block";
  popoverWrapper.style.left = "";
  popoverWrapper.style.top = "";
  popoverWrapper.style.bottom = "";
  popoverWrapper.style.right = "";

  // 设置无障碍属性
  popoverWrapper.id = "driver-popover-content";
  popoverWrapper.setAttribute("role", "dialog");
  popoverWrapper.setAttribute("aria-labelledby", "driver-popover-title");
  popoverWrapper.setAttribute("aria-describedby", "driver-popover-description");

  // 重置箭头位置类
  const popoverArrow = popover.arrow;
  popoverArrow.className = "driver-popover-arrow";

  // 设置自定义弹出框类名
  const customPopoverClass = step.popover?.popoverClass || getConfig("popoverClass") || "";
  popoverWrapper.className = `driver-popover ${customPopoverClass}`.trim();

  // 处理弹出框按钮点击事件
  onDriverClick(
    popover.wrapper,
    e => {
      const target = e.target;

      const onNextClick = step.popover?.onNextClick || getConfig("onNextClick");
      const onPrevClick = step.popover?.onPrevClick || getConfig("onPrevClick");
      const onCloseClick = step.popover?.onCloseClick || getConfig("onCloseClick");

      // 处理下一步按钮点击
      if (target.closest(".driver-popover-next-btn")) {
        // 如果有自定义回调函数，调用它，否则触发事件
        if (onNextClick) {
          return onNextClick(element, step, {
            config: getConfig(),
            state: getState(),
            driver: getCurrentDriver(),
          });
        } else {
          return emit("nextClick");
        }
      }

      // 处理上一步按钮点击
      if (target.closest(".driver-popover-prev-btn")) {
        if (onPrevClick) {
          return onPrevClick(element, step, {
            config: getConfig(),
            state: getState(),
            driver: getCurrentDriver(),
          });
        } else {
          return emit("prevClick");
        }
      }

      // 处理关闭按钮点击
      if (target.closest(".driver-popover-close-btn")) {
        if (onCloseClick) {
          return onCloseClick(element, step, {
            config: getConfig(),
            state: getState(),
            driver: getCurrentDriver(),
          });
        } else {
          return emit("closeClick");
        }
      }

      return undefined;
    },
    target => {
      // 只有当点击driver按钮时才阻止默认行为
      // 这允许我们在弹出框标题和描述中包含链接
      return (
        !popover?.description.contains(target) &&
        !popover?.title.contains(target) &&
        typeof target.className === "string" &&
        target.className.includes("driver-popover")
      );
    }
  );

  setState("popover", popover);

  // 调用弹出框渲染回调
  const onPopoverRender = step.popover?.onPopoverRender || getConfig("onPopoverRender");
  if (onPopoverRender) {
    onPopoverRender(popover, {
      config: getConfig(),
      state: getState(),
      driver: getCurrentDriver(),
    });
  }

  // 重新定位弹出框并确保其在视图中
  repositionPopover(element, step);
  bringInView(popoverWrapper);

  // 聚焦到第一个可聚焦元素
  const isToDummyElement = element.classList.contains("driver-dummy-element");
  const focusableElement = getFocusableElements([popoverWrapper, ...(isToDummyElement ? [] : [element])]);
  if (focusableElement.length > 0) {
    focusableElement[0].focus();
  }
}

// 获取弹出框尺寸
export function getPopoverDimensions() {
  const popover = getState("popover");
  if (!popover?.wrapper) {
    return;
  }

  const boundingClientRect = popover.wrapper.getBoundingClientRect();

  const stagePadding = getConfig("stagePadding") || 0;
  const popoverOffset = getConfig("popoverOffset") || 0;

  return {
    width: boundingClientRect.width + stagePadding + popoverOffset,
    height: boundingClientRect.height + stagePadding + popoverOffset,

    realWidth: boundingClientRect.width,
    realHeight: boundingClientRect.height,
  };
}

// 计算左右侧弹出框的垂直位置
export function calculateTopForLeftRight(alignment, config) {
  const { elementDimensions, popoverDimensions, popoverPadding, popoverArrowDimensions } = config;

  if (alignment === "start") {
    return Math.max(
      Math.min(
        elementDimensions.top - popoverPadding,
        window.innerHeight - popoverDimensions.realHeight - popoverArrowDimensions.width
      ),
      popoverArrowDimensions.width
    );
  }

  if (alignment === "end") {
    return Math.max(
      Math.min(
        elementDimensions.top - popoverDimensions.realHeight + elementDimensions.height + popoverPadding,
        window.innerHeight - popoverDimensions.realHeight - popoverArrowDimensions.width
      ),
      popoverArrowDimensions.width
    );
  }

  if (alignment === "center") {
    return Math.max(
      Math.min(
        elementDimensions.top + elementDimensions.height / 2 - popoverDimensions.realHeight / 2,
        window.innerHeight - popoverDimensions.realHeight - popoverArrowDimensions.width
      ),
      popoverArrowDimensions.width
    );
  }

  return 0;
}

// 计算上下侧弹出框的水平位置
export function calculateLeftForTopBottom(alignment, config) {
  const { elementDimensions, popoverDimensions, popoverPadding, popoverArrowDimensions } = config;

  if (alignment === "start") {
    return Math.max(
      Math.min(
        elementDimensions.left - popoverPadding,
        window.innerWidth - popoverDimensions.realWidth - popoverArrowDimensions.width
      ),
      popoverArrowDimensions.width
    );
  }

  if (alignment === "end") {
    return Math.max(
      Math.min(
        elementDimensions.left - popoverDimensions.realWidth + elementDimensions.width + popoverPadding,
        window.innerWidth - popoverDimensions.realWidth - popoverArrowDimensions.width
      ),
      popoverArrowDimensions.width
    );
  }

  if (alignment === "center") {
    return Math.max(
      Math.min(
        elementDimensions.left + elementDimensions.width / 2 - popoverDimensions.realWidth / 2,
        window.innerWidth - popoverDimensions.realWidth - popoverArrowDimensions.width
      ),
      popoverArrowDimensions.width
    );
  }

  return 0;
}

// 重新定位弹出框
export function repositionPopover(element, step) {
  const popover = getState("popover");
  if (!popover) {
    return;
  }

  const { align = "start", side = "left" } = step?.popover || {};

  // 配置弹出框定位参数
  const requiredAlignment = align;
  const requiredSide = element.id === "driver-dummy-element" ? "over" : side;
  const popoverPadding = getConfig("stagePadding") || 0;

  const popoverDimensions = getPopoverDimensions();
  const popoverArrowDimensions = popover.arrow.getBoundingClientRect();
  const elementDimensions = element.getBoundingClientRect();

  // 计算各方向的空间是否足够
  const topValue = elementDimensions.top - popoverDimensions.height;
  let isTopOptimal = topValue >= 0;

  const bottomValue = window.innerHeight - (elementDimensions.bottom + popoverDimensions.height);
  let isBottomOptimal = bottomValue >= 0;

  const leftValue = elementDimensions.left - popoverDimensions.width;
  let isLeftOptimal = leftValue >= 0;

  const rightValue = window.innerWidth - (elementDimensions.right + popoverDimensions.width);
  let isRightOptimal = rightValue >= 0;

  // 检查是否有任何方向有足够空间
  const noneOptimal = !isTopOptimal && !isBottomOptimal && !isLeftOptimal && !isRightOptimal;
  let popoverRenderedSide = requiredSide;

  // 根据首选方向调整其他方向的状态
  if (requiredSide === "top" && isTopOptimal) {
    isRightOptimal = isLeftOptimal = isBottomOptimal = false;
  } else if (requiredSide === "bottom" && isBottomOptimal) {
    isRightOptimal = isLeftOptimal = isTopOptimal = false;
  } else if (requiredSide === "left" && isLeftOptimal) {
    isRightOptimal = isTopOptimal = isBottomOptimal = false;
  } else if (requiredSide === "right" && isRightOptimal) {
    isLeftOptimal = isTopOptimal = isBottomOptimal = false;
  }

  // 处理居中显示（用于虚拟元素）
  if (requiredSide === "over") {
    const leftToSet = window.innerWidth / 2 - popoverDimensions.realWidth / 2;
    const topToSet = window.innerHeight / 2 - popoverDimensions.realHeight / 2;

    popover.wrapper.style.left = `${leftToSet}px`;
    popover.wrapper.style.right = `auto`;
    popover.wrapper.style.top = `${topToSet}px`;
    popover.wrapper.style.bottom = `auto`;
  } else if (noneOptimal) {
    // 没有足够空间时，显示在窗口底部中间
    const leftValue = window.innerWidth / 2 - popoverDimensions.realWidth / 2;
    const bottomValue = 10;

    popover.wrapper.style.left = `${leftValue}px`;
    popover.wrapper.style.right = `auto`;
    popover.wrapper.style.bottom = `${bottomValue}px`;
    popover.wrapper.style.top = `auto`;
  } else if (isLeftOptimal) {
    // 左侧显示
    const leftToSet = Math.min(
      leftValue,
      window.innerWidth - popoverDimensions.realWidth - popoverArrowDimensions.width
    );

    const topToSet = calculateTopForLeftRight(requiredAlignment, {
      elementDimensions,
      popoverDimensions,
      popoverPadding,
      popoverArrowDimensions,
    });

    popover.wrapper.style.left = `${leftToSet}px`;
    popover.wrapper.style.top = `${topToSet}px`;
    popover.wrapper.style.bottom = `auto`;
    popover.wrapper.style.right = "auto";

    popoverRenderedSide = "left";
  } else if (isRightOptimal) {
    // 右侧显示
    const rightToSet = Math.min(
      rightValue,
      window.innerWidth - popoverDimensions.realWidth - popoverArrowDimensions.width
    );
    const topToSet = calculateTopForLeftRight(requiredAlignment, {
      elementDimensions,
      popoverDimensions,
      popoverPadding,
      popoverArrowDimensions,
    });

    popover.wrapper.style.right = `${rightToSet}px`;
    popover.wrapper.style.top = `${topToSet}px`;
    popover.wrapper.style.bottom = `auto`;
    popover.wrapper.style.left = "auto";

    popoverRenderedSide = "right";
  } else if (isTopOptimal) {
    // 上方显示
    const topToSet = Math.min(
      topValue,
      window.innerHeight - popoverDimensions.realHeight - popoverArrowDimensions.width
    );
    let leftToSet = calculateLeftForTopBottom(requiredAlignment, {
      elementDimensions,
      popoverDimensions,
      popoverPadding,
      popoverArrowDimensions,
    });

    popover.wrapper.style.top = `${topToSet}px`;
    popover.wrapper.style.left = `${leftToSet}px`;
    popover.wrapper.style.bottom = `auto`;
    popover.wrapper.style.right = "auto";

    popoverRenderedSide = "top";
  } else if (isBottomOptimal) {
    // 下方显示
    const bottomToSet = Math.min(
      bottomValue,
      window.innerHeight - popoverDimensions.realHeight - popoverArrowDimensions.width
    );

    let leftToSet = calculateLeftForTopBottom(requiredAlignment, {
      elementDimensions,
      popoverDimensions,
      popoverPadding,
      popoverArrowDimensions,
    });

    popover.wrapper.style.left = `${leftToSet}px`;
    popover.wrapper.style.bottom = `${bottomToSet}px`;
    popover.wrapper.style.top = `auto`;
    popover.wrapper.style.right = "auto";

    popoverRenderedSide = "bottom";
  }

  // 如果元素滚动出可见区域，弹出框仍保持在屏幕上
  // 重新渲染箭头以确保其位置正确
  if (!noneOptimal) {
    renderPopoverArrow(requiredAlignment, popoverRenderedSide, element);
  } else {
    popover.arrow.classList.add("driver-popover-arrow-none");
  }
}

// 渲染弹出框箭头
export function renderPopoverArrow(alignment, side, element) {
  const popover = getState("popover");
  if (!popover) {
    return;
  }

  const elementDimensions = element.getBoundingClientRect();
  const popoverDimensions = getPopoverDimensions();
  const popoverArrow = popover.arrow;

  const popoverWidth = popoverDimensions.width;
  const windowWidth = window.innerWidth;
  const elementWidth = elementDimensions.width;
  const elementLeft = elementDimensions.left;

  const popoverHeight = popoverDimensions.height;
  const windowHeight = window.innerHeight;
  const elementTop = elementDimensions.top;
  const elementHeight = elementDimensions.height;

  // 移除所有箭头类
  popoverArrow.className = "driver-popover-arrow";

  let arrowSide = side;
  let arrowAlignment = alignment;

  // 根据元素位置调整箭头方向和位置
  if (side === "top") {
    if (elementLeft + elementWidth <= 0) {
      arrowSide = "right";
      arrowAlignment = "end";
    } else if (elementLeft + elementWidth - popoverWidth <= 0) {
      arrowSide = "top";
      arrowAlignment = "start";
    }
    if (elementLeft >= windowWidth) {
      arrowSide = "left";
      arrowAlignment = "end";
    } else if (elementLeft + popoverWidth >= windowWidth) {
      arrowSide = "top";
      arrowAlignment = "end";
    }
  } else if (side === "bottom") {
    if (elementLeft + elementWidth <= 0) {
      arrowSide = "right";
      arrowAlignment = "start";
    } else if (elementLeft + elementWidth - popoverWidth <= 0) {
      arrowSide = "bottom";
      arrowAlignment = "start";
    }
    if (elementLeft >= windowWidth) {
      arrowSide = "left";
      arrowAlignment = "start";
    } else if (elementLeft + popoverWidth >= windowWidth) {
      arrowSide = "bottom";
      arrowAlignment = "end";
    }
  } else if (side === "left") {
    if (elementTop + elementHeight <= 0) {
      arrowSide = "bottom";
      arrowAlignment = "end";
    } else if (elementTop + elementHeight - popoverHeight <= 0) {
      arrowSide = "left";
      arrowAlignment = "start";
    }

    if (elementTop >= windowHeight) {
      arrowSide = "top";
      arrowAlignment = "end";
    } else if (elementTop + popoverHeight >= windowHeight) {
      arrowSide = "left";
      arrowAlignment = "end";
    }
  } else if (side === "right") {
    if (elementTop + elementHeight <= 0) {
      arrowSide = "bottom";
      arrowAlignment = "start";
    } else if (elementTop + elementHeight - popoverHeight <= 0) {
      arrowSide = "right";
      arrowAlignment = "start";
    }

    if (elementTop >= windowHeight) {
      arrowSide = "top";
      arrowAlignment = "start";
    } else if (elementTop + popoverHeight >= windowHeight) {
      arrowSide = "right";
      arrowAlignment = "end";
    }
  }

  if (!arrowSide) {
    popoverArrow.classList.add("driver-popover-arrow-none");
  } else {
    popoverArrow.classList.add(`driver-popover-arrow-side-${arrowSide}`);
    popoverArrow.classList.add(`driver-popover-arrow-align-${arrowAlignment}`);

    const elementRect = element.getBoundingClientRect();
    const arrowRect = popoverArrow.getBoundingClientRect();
    const stagePadding = getConfig("stagePadding") || 0;

    // 检查元素是否部分在视口中
    const isElementPartiallyInViewPort =
      elementRect.left - stagePadding < window.innerWidth &&
      elementRect.right + stagePadding > 0 &&
      elementRect.top - stagePadding < window.innerHeight &&
      elementRect.bottom + stagePadding > 0;

    // 处理底部弹出框的特殊情况
    if (side === "bottom" && isElementPartiallyInViewPort) {
      const isArrowWithinElementBounds =
        arrowRect.x > elementRect.x && arrowRect.x + arrowRect.width < elementRect.x + elementRect.width;

      if (!isArrowWithinElementBounds) {
        popoverArrow.classList.remove(`driver-popover-arrow-align-${arrowAlignment}`);
        popoverArrow.classList.add(`driver-popover-arrow-none`);
        // 减少顶部位置的内边距
        popover.wrapper.style.transform = `translateY(-${stagePadding / 2}px)`;
      } else {
        popover.wrapper.style.transform = "";
      }
    } else {
      popover.wrapper.style.transform = "";
    }
  }
}

// 创建弹出框DOM结构
export function createPopover() {
  const wrapper = document.createElement("div");
  wrapper.className = "driver-popover";

  const arrow = document.createElement("div");
  arrow.className = "driver-popover-arrow";

  const title = document.createElement("div");
  title.id = "driver-popover-title";
  title.className = "driver-popover-title";

  const description = document.createElement("div");
  description.id = "driver-popover-description";
  description.className = "driver-popover-description";

  const footer = document.createElement("div");
  footer.className = "driver-popover-footer";

  const progress = document.createElement("div");
  progress.className = "driver-popover-progress";

  const footerButtons = document.createElement("div");
  footerButtons.className = "driver-popover-footer-buttons";

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "driver-popover-btn driver-popover-prev-btn";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "driver-popover-btn driver-popover-next-btn";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "driver-popover-btn driver-popover-close-btn";
  closeButton.innerHTML = "&times;";

  footerButtons.appendChild(previousButton);
  footerButtons.appendChild(nextButton);

  footer.appendChild(footerButtons);
  footer.appendChild(progress);

  wrapper.appendChild(arrow);
  wrapper.appendChild(title);
  wrapper.appendChild(description);
  wrapper.appendChild(footer);
  wrapper.appendChild(closeButton);

  return {
    wrapper,
    arrow,
    title,
    description,
    footer,
    progress,
    previousButton,
    nextButton,
    closeButton,
    footerButtons,
  };
}

export function destroyPopover() {
  const popover = getState("popover");
  if (!popover) {
    return;
  }

  if (popover.wrapper.parentNode) {
    popover.wrapper.parentNode.removeChild(popover.wrapper);
  }

  setState("popover", null);
}