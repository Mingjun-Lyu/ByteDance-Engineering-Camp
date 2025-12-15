import { destroyPopover } from "./popover";
import { destroyOverlay } from "./overlay";
import { destroyEvents, initEvents, requireRefresh } from "./events";
import { configure, getConfig, getCurrentDriver, setCurrentDriver } from "../utils/config";
import { destroyHighlight, highlight } from "./highlight";
import { destroyEmitter, listen } from "../utils/emitter";
import { getState, resetState, setState } from "../utils/state";
import "../styles/driver.css";


// ==================== 步骤1: 创建引导驱动实例 ====================
// 用户调用 driver(options) 创建引导实例
export function driver(options = {}) {
  // 步骤1.1: 配置初始化
  configure(options);

  // ==================== 步骤2: 定义事件处理函数 ====================
  
  // 步骤2.1: 处理关闭引导
  function handleClose() {
    if (!getConfig("allowClose")) {
      return;
    }

    destroy();
  }

  // 步骤2.2: 处理遮罩层点击事件 
  function handleOverlayClick() {
    const overlayClickBehavior = getConfig("overlayClickBehavior");

    // 如果允许关闭且点击行为是关闭，则销毁引导
    if (getConfig("allowClose") && overlayClickBehavior === "close") {
      destroy();
      return;
    }

    // 如果是自定义函数，执行自定义行为
    if (typeof overlayClickBehavior === "function") {
      const activeStep = getState("__activeStep");
      const activeElement = getState("__activeElement");

      overlayClickBehavior(activeElement, activeStep, {
        config: getConfig(),
        state: getState(),
        driver: getCurrentDriver(),
      });

      return;
    }

    // 如果是下一步行为，移动到下一步
    if (overlayClickBehavior === "nextStep") {
      moveNext();
    }
  }

  // ==================== 步骤3: 定义导航函数 ====================
  
  // 步骤3.1: 移动到下一步 - 核心导航逻辑
  function moveNext() {
    const activeIndex = getState("activeIndex");
    const steps = getConfig("steps") || [];
    if (typeof activeIndex === "undefined") {
      return;
    }

    const nextStepIndex = activeIndex + 1;
    if (steps[nextStepIndex]) {
      drive(nextStepIndex);  // 步骤3.1.1: 执行下一步
    } else {
      destroy();  // 步骤3.1.2: 如果没有下一步，销毁引导
    }
  }

  // 步骤3.2: 移动到上一步
  function movePrevious() {
    const activeIndex = getState("activeIndex");
    const steps = getConfig("steps") || [];
    if (typeof activeIndex === "undefined") {
      return;
    }

    const previousStepIndex = activeIndex - 1;
    if (steps[previousStepIndex]) {
      drive(previousStepIndex);
    } else {
      destroy();
    }
  }

  // 步骤3.3: 移动到指定步骤
  function moveTo(index) {
    const steps = getConfig("steps") || [];

    if (steps[index]) {
      drive(index);
    } else {
      destroy();
    }
  }

  // ==================== 步骤4: 定义键盘事件处理函数 ====================
  
  // 步骤4.1: 处理左箭头按键事件
  function handleArrowLeft() {
    const isTransitioning = getState("__transitionCallback");
    if (isTransitioning) {
      return;  // 步骤4.1.1: 如果正在动画中，忽略事件
    }

    const activeIndex = getState("activeIndex");
    const activeStep = getState("__activeStep");
    const activeElement = getState("__activeElement");
    if (typeof activeIndex === "undefined" || typeof activeStep === "undefined") {
      return;  // 步骤4.1.2: 如果没有活动步骤，忽略事件
    }

    const currentStepIndex = getState("activeIndex");
    if (typeof currentStepIndex === "undefined") {
      return;
    }

    // 步骤4.1.3: 优先使用步骤级别的回调，否则使用全局回调
    const onPrevClick = activeStep.popover?.onPrevClick || getConfig("onPrevClick");
    if (onPrevClick) {
      // 步骤4.1.4: 如果有自定义回调，执行它
      return onPrevClick(activeElement, activeStep, {
        config: getConfig(),
        state: getState(),
        driver: getCurrentDriver(),
      });
    }

    // 步骤4.1.5: 如果没有自定义回调，执行默认导航
    movePrevious();
  }

  // 步骤4.2: 处理右箭头按键事件 - 进入下一步的关键处理
  function handleArrowRight() {
    const isTransitioning = getState("__transitionCallback");
    if (isTransitioning) {
      return;  // 步骤4.2.1: 如果正在动画中，忽略事件
    }

    const activeIndex = getState("activeIndex");
    const activeStep = getState("__activeStep");
    const activeElement = getState("__activeElement");
    if (typeof activeIndex === "undefined" || typeof activeStep === "undefined") {
      return;  // 步骤4.2.2: 如果没有活动步骤，忽略事件
    }

    // 步骤4.2.3: 优先使用步骤级别的回调，否则使用全局回调
    const onNextClick = activeStep.popover?.onNextClick || getConfig("onNextClick");
    if (onNextClick) {
      // 步骤4.2.4: 如果有自定义回调，执行它
      return onNextClick(activeElement, activeStep, {
        config: getConfig(),
        state: getState(),
        driver: getCurrentDriver(),
      });
    }

    // 步骤4.2.5: 如果没有自定义回调，执行默认导航到下一步
    moveNext();
  }

  // ==================== 步骤5: 初始化引导系统 ====================
  function init() {
    if (getState("isInitialized")) {
      return;  // 步骤5.1: 如果已经初始化，直接返回
    }

    setState("isInitialized", true);
    // 步骤5.2: 添加引导相关的CSS类
    document.body.classList.add("driver-active", getConfig("animate") ? "driver-fade" : "driver-simple");

    // 步骤5.3: 初始化事件监听
    initEvents();

    // 步骤5.4: 监听各种事件
    listen("overlayClick", handleOverlayClick);
    listen("escapePress", handleClose);
    listen("arrowLeftPress", handleArrowLeft);
    listen("arrowRightPress", handleArrowRight);
  }

  // ==================== 步骤6: 执行引导步骤 - 核心执行流程 ====================
  function drive(stepIndex = 0) {
    const steps = getConfig("steps");
    if (!steps) {
      console.error("没有可执行的引导步骤");
      destroy();
      return;  // 步骤6.1: 如果没有步骤配置，报错并销毁
    }

    if (!steps[stepIndex]) {
      destroy();
      return;  // 步骤6.2: 如果指定步骤不存在，销毁引导
    }

    // 步骤6.3: 保存当前焦点元素，用于引导结束后恢复焦点
    setState("__activeOnDestroyed", document.activeElement);
    setState("activeIndex", stepIndex);

    const currentStep = steps[stepIndex];
    const hasNextStep = steps[stepIndex + 1];
    const hasPreviousStep = steps[stepIndex - 1];

    // 步骤6.4: 配置按钮文本和显示逻辑
    const doneBtnText = currentStep.popover?.doneBtnText || getConfig("doneBtnText") || "完成";
    const allowsClosing = getConfig("allowClose");
    const showProgress =
      typeof currentStep.popover?.showProgress !== "undefined"
        ? currentStep.popover?.showProgress
        : getConfig("showProgress");
    const progressText = currentStep.popover?.progressText || getConfig("progressText") || "{{current}} / {{total}}";
    const progressTextReplaced = progressText
      .replace("{{current}}", `${stepIndex + 1}`)
      .replace("{{total}}", `${steps.length}`);

    // 步骤6.5: 计算要显示的按钮
    const configuredButtons = currentStep.popover?.showButtons || getConfig("showButtons");
    const calculatedButtons = [
      "next",
      "previous",
      ...(allowsClosing ? ["close"] : []),
    ].filter(b => {
      return !configuredButtons?.length || configuredButtons.includes(b);
    });

    // 步骤6.6: 获取回调函数
    const onNextClick = currentStep.popover?.onNextClick || getConfig("onNextClick");
    const onPrevClick = currentStep.popover?.onPrevClick || getConfig("onPrevClick");
    const onCloseClick = currentStep.popover?.onCloseClick || getConfig("onCloseClick");

    // ==================== 步骤7: 执行高亮显示 - 核心渲染步骤 ====================
    highlight({
      ...currentStep,
      popover: {
        showButtons: calculatedButtons,
        nextBtnText: !hasNextStep ? doneBtnText : undefined,
        disableButtons: [...(!hasPreviousStep ? ["previous"] : [])],
        showProgress: showProgress,
        progressText: progressTextReplaced,
        // 步骤7.1: 配置下一步按钮回调
        onNextClick: onNextClick
          ? onNextClick  // 如果有自定义回调，使用它
          : () => {
              // 步骤7.1.1: 默认下一步处理逻辑
              if (!hasNextStep) {
                destroy();  // 如果没有下一步，销毁引导
              } else {
                drive(stepIndex + 1);  // 步骤7.1.2: 执行下一步
              }
            },
        // 步骤7.2: 配置上一步按钮回调
        onPrevClick: onPrevClick
          ? onPrevClick  // 如果有自定义回调，使用它
          : () => {
              drive(stepIndex - 1);  // 步骤7.2.1: 执行上一步
            },
        // 步骤7.3: 配置关闭按钮回调
        onCloseClick: onCloseClick
          ? onCloseClick  // 如果有自定义回调，使用它
          : () => {
              destroy();  // 步骤7.3.1: 默认关闭处理
            },
        ...(currentStep?.popover || {}),
      },
    });
  }

  // ==================== 步骤8: 销毁引导系统 ====================
  function destroy(withOnDestroyStartedHook = true) {
    const activeElement = getState("__activeElement");
    const activeStep = getState("__activeStep");

    const activeOnDestroyed = getState("__activeOnDestroyed");

    const onDestroyStarted = getConfig("onDestroyStarted");

    if (withOnDestroyStartedHook && onDestroyStarted) {
      const isActiveDummyElement = !activeElement || activeElement?.id === "driver-dummy-element";
      onDestroyStarted(isActiveDummyElement ? undefined : activeElement, activeStep, {
        config: getConfig(),
        state: getState(),
        driver: getCurrentDriver(),
      });
      return;  // 步骤8.1: 如果有销毁开始回调，执行后返回
    }

    const onDeselected = activeStep?.onDeselected || getConfig("onDeselected");
    const onDestroyed = getConfig("onDestroyed");

    // 步骤8.2: 移除CSS类
    document.body.classList.remove("driver-active", "driver-fade", "driver-simple");

    // 步骤8.3: 销毁各个模块
    destroyEvents();
    destroyPopover();
    destroyHighlight();
    destroyOverlay();
    destroyEmitter();

    // 步骤8.4: 重置状态
    resetState();

    // 步骤8.5: 触发回调函数
    if (activeElement && activeStep) {
      const isActiveDummyElement = activeElement.id === "driver-dummy-element";
      if (onDeselected) {
        onDeselected(isActiveDummyElement ? undefined : activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          driver: getCurrentDriver(),
        });
      }

      if (onDestroyed) {
        // 步骤8.5.2: 触发销毁完成回调
        onDestroyed(isActiveDummyElement ? undefined : activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          driver: getCurrentDriver(),
        });
      }
    }

    // 步骤8.6: 恢复焦点
    if (activeOnDestroyed) {
      activeOnDestroyed.focus();
    }
  }

  // ==================== 步骤9: 创建引导API对象 ====================
  const api = {

    // 步骤9.1: 检查引导是否激活
    isActive: () => getState("isInitialized") || false,

    // 步骤9.2: 刷新当前高亮显示
    refresh: requireRefresh,

    // 步骤9.3: 启动引导 - 用户调用的主要入口
    drive: (stepIndex = 0) => {
      init();      // 步骤9.3.1: 初始化系统
      drive(stepIndex);  // 步骤9.3.2: 执行指定步骤
    },

    // 步骤9.4: 动态更新配置
    setConfig: configure,

    // 步骤9.5: 动态设置步骤
    setSteps: (steps) => {
      resetState();  // 步骤9.5.1: 重置状态
      configure({
        ...getConfig(),
        steps,  // 步骤9.5.2: 更新步骤配置
      });
    },

    // 步骤9.6: 获取配置
    getConfig,

    // 步骤9.7: 获取状态
    getState,

    // 步骤9.8: 获取当前活动步骤索引
    getActiveIndex: () => getState("activeIndex"),

    // 步骤9.9: 检查是否是第一步
    isFirstStep: () => getState("activeIndex") === 0,

    // 步骤9.10: 检查是否是最后一步
    isLastStep: () => {
      const steps = getConfig("steps") || [];
      const activeIndex = getState("activeIndex");

      return activeIndex !== undefined && activeIndex === steps.length - 1;
    },

    // 步骤9.11: 获取当前活动步骤
    getActiveStep: () => getState("activeStep"),

    // 步骤9.12: 获取当前活动元素
    getActiveElement: () => getState("activeElement"),

    // 步骤9.13: 获取前一个元素
    getPreviousElement: () => getState("previousElement"),

    // 步骤9.14: 获取前一个步骤
    getPreviousStep: () => getState("previousStep"),

    // 步骤9.15: 导航到下一步
    moveNext,

    // 步骤9.16: 导航到上一步
    movePrevious,

    // 步骤9.17: 导航到指定步骤
    moveTo,

    // 步骤9.18: 检查是否有下一步
    hasNextStep: () => {
      const steps = getConfig("steps") || [];
      const activeIndex = getState("activeIndex");

      return activeIndex !== undefined && !!steps[activeIndex + 1];
    },

    // 步骤9.19: 检查是否有上一步
    hasPreviousStep: () => {
      const steps = getConfig("steps") || [];
      const activeIndex = getState("activeIndex");

      return activeIndex !== undefined && !!steps[activeIndex - 1];
    },

    // 步骤9.20: 高亮显示指定步骤（不显示弹出框）
    highlight: (step) => {
      init();  // 步骤9.20.1: 初始化系统
      highlight({
        ...step,
        popover: step.popover
          ? {
              showButtons: [],
              showProgress: false,
              progressText: "",
              ...step.popover,
            }
          : undefined,
      });
    },

    // 步骤9.21: 销毁引导系统
    destroy: () => {
      destroy(false);  // 步骤9.21.1: 不触发销毁开始回调
    },
  };

  // ==================== 步骤10: 设置当前驱动实例 ====================
  setCurrentDriver(api);

  return api;  // 步骤10.1: 返回API对象给用户使用
}