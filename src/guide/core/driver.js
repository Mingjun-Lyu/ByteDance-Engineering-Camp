import { destroyPopover } from "./popover";
import { destroyOverlay } from "./overlay";
import { destroyEvents, initEvents, requireRefresh } from "./events";
import { configure, getConfig, getCurrentDriver, setCurrentDriver } from "../utils/config";
import { destroyHighlight, highlight } from "./highlight";
import { destroyEmitter, listen } from "../utils/emitter";
import { getState, resetState, setState } from "../utils/state";
import "../styles/driver.css";


//创建引导驱动实例
export function driver(options = {}) {
  // 配置初始化
  configure(options);

  //处理关闭引导
  function handleClose() {
    if (!getConfig("allowClose")) {
      return;
    }

    destroy();
  }

  // 处理遮罩层点击事件 
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

  // 移动到下一步
  function moveNext() {
    const activeIndex = getState("activeIndex");
    const steps = getConfig("steps") || [];
    if (typeof activeIndex === "undefined") {
      return;
    }

    const nextStepIndex = activeIndex + 1;
    if (steps[nextStepIndex]) {
      drive(nextStepIndex);
    } else {
      destroy();
    }
  }

  // 移动到上一步
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

  // 移动到指定步骤
  function moveTo(index) {
    const steps = getConfig("steps") || [];

    if (steps[index]) {
      drive(index);
    } else {
      destroy();
    }
  }

  // 处理左箭头按键事件
  function handleArrowLeft() {
    const isTransitioning = getState("__transitionCallback");
    if (isTransitioning) {
      return;
    }

    const activeIndex = getState("activeIndex");
    const activeStep = getState("__activeStep");
    const activeElement = getState("__activeElement");
    if (typeof activeIndex === "undefined" || typeof activeStep === "undefined") {
      return;
    }

    const currentStepIndex = getState("activeIndex");
    if (typeof currentStepIndex === "undefined") {
      return;
    }

    // 优先使用步骤级别的回调，否则使用全局回调
    const onPrevClick = activeStep.popover?.onPrevClick || getConfig("onPrevClick");
    if (onPrevClick) {
      return onPrevClick(activeElement, activeStep, {
        config: getConfig(),
        state: getState(),
        driver: getCurrentDriver(),
      });
    }

    movePrevious();
  }

  // 处理右箭头按键事件
  function handleArrowRight() {
    const isTransitioning = getState("__transitionCallback");
    if (isTransitioning) {
      return;
    }

    const activeIndex = getState("activeIndex");
    const activeStep = getState("__activeStep");
    const activeElement = getState("__activeElement");
    if (typeof activeIndex === "undefined" || typeof activeStep === "undefined") {
      return;
    }

    const onNextClick = activeStep.popover?.onNextClick || getConfig("onNextClick");
    if (onNextClick) {
      return onNextClick(activeElement, activeStep, {
        config: getConfig(),
        state: getState(),
        driver: getCurrentDriver(),
      });
    }

    moveNext();
  }

  // 初始化引导系统
  function init() {
    if (getState("isInitialized")) {
      return;
    }

    setState("isInitialized", true);
    // 添加引导相关的CSS类
    document.body.classList.add("driver-active", getConfig("animate") ? "driver-fade" : "driver-simple");

    // 初始化事件监听
    initEvents();

    // 监听各种事件
    listen("overlayClick", handleOverlayClick);
    listen("escapePress", handleClose);
    listen("arrowLeftPress", handleArrowLeft);
    listen("arrowRightPress", handleArrowRight);
  }

  // 执行引导步骤
  function drive(stepIndex = 0) {
    const steps = getConfig("steps");
    if (!steps) {
      console.error("没有可执行的引导步骤");
      destroy();
      return;
    }

    if (!steps[stepIndex]) {
      destroy();
      return;
    }

    // 保存当前焦点元素，用于引导结束后恢复焦点
    setState("__activeOnDestroyed", document.activeElement);
    setState("activeIndex", stepIndex);

    const currentStep = steps[stepIndex];
    const hasNextStep = steps[stepIndex + 1];
    const hasPreviousStep = steps[stepIndex - 1];

    // 配置按钮文本和显示逻辑
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

    // 计算要显示的按钮
    const configuredButtons = currentStep.popover?.showButtons || getConfig("showButtons");
    const calculatedButtons = [
      "next",
      "previous",
      ...(allowsClosing ? ["close"] : []),
    ].filter(b => {
      return !configuredButtons?.length || configuredButtons.includes(b);
    });

    // 获取回调函数
    const onNextClick = currentStep.popover?.onNextClick || getConfig("onNextClick");
    const onPrevClick = currentStep.popover?.onPrevClick || getConfig("onPrevClick");
    const onCloseClick = currentStep.popover?.onCloseClick || getConfig("onCloseClick");

    // 高亮当前步骤元素
    highlight({
      ...currentStep,
      popover: {
        showButtons: calculatedButtons,
        nextBtnText: !hasNextStep ? doneBtnText : undefined,
        disableButtons: [...(!hasPreviousStep ? ["previous"] : [])],
        showProgress: showProgress,
        progressText: progressTextReplaced,
        onNextClick: onNextClick
          ? onNextClick
          : () => {
              if (!hasNextStep) {
                destroy();
              } else {
                drive(stepIndex + 1);
              }
            },
        onPrevClick: onPrevClick
          ? onPrevClick
          : () => {
              drive(stepIndex - 1);
            },
        onCloseClick: onCloseClick
          ? onCloseClick
          : () => {
              destroy();
            },
        ...(currentStep?.popover || {}),
      },
    });
  }

  // 销毁引导系统
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
      return;
    }

    const onDeselected = activeStep?.onDeselected || getConfig("onDeselected");
    const onDestroyed = getConfig("onDestroyed");

    // 移除CSS类
    document.body.classList.remove("driver-active", "driver-fade", "driver-simple");

    // 销毁各个模块
    destroyEvents();
    destroyPopover();
    destroyHighlight();
    destroyOverlay();
    destroyEmitter();

    // 重置状态
    resetState();

    // 触发回调函数
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
        onDestroyed(isActiveDummyElement ? undefined : activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          driver: getCurrentDriver(),
        });
      }
    }

    // 恢复焦点
    if (activeOnDestroyed) {
      activeOnDestroyed.focus();
    }
  }

  // 引导API对象
  const api = {

    isActive: () => getState("isInitialized") || false,

    refresh: requireRefresh,

    drive: (stepIndex = 0) => {
      init();
      drive(stepIndex);
    },

    setConfig: configure,

    setSteps: (steps) => {
      resetState();
      configure({
        ...getConfig(),
        steps,
      });
    },

    getConfig,

    getState,

    getActiveIndex: () => getState("activeIndex"),

    isFirstStep: () => getState("activeIndex") === 0,

    isLastStep: () => {
      const steps = getConfig("steps") || [];
      const activeIndex = getState("activeIndex");

      return activeIndex !== undefined && activeIndex === steps.length - 1;
    },

    getActiveStep: () => getState("activeStep"),

    getActiveElement: () => getState("activeElement"),

    getPreviousElement: () => getState("previousElement"),

    getPreviousStep: () => getState("previousStep"),

    moveNext,

    movePrevious,

    moveTo,

    hasNextStep: () => {
      const steps = getConfig("steps") || [];
      const activeIndex = getState("activeIndex");

      return activeIndex !== undefined && !!steps[activeIndex + 1];
    },

    hasPreviousStep: () => {
      const steps = getConfig("steps") || [];
      const activeIndex = getState("activeIndex");

      return activeIndex !== undefined && !!steps[activeIndex - 1];
    },

    highlight: (step) => {
      init();
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

    destroy: () => {
      destroy(false);
    },
  };

  // 设置当前驱动实例
  setCurrentDriver(api);

  return api;
}