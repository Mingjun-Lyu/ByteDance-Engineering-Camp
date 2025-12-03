import { easeInOutQuad } from "../utils/utils";
import { onDriverClick } from "./events";
import { emit } from "../utils/emitter";
import { getConfig } from "../utils/config";
import { getState, setState } from "../utils/state";


// 执行遮罩层动画过渡
export function transitionStage(elapsed, duration, from, to) {
  let activeStagePosition = getState("__activeStagePosition");

  // 获取元素的边界矩形信息
  const fromDefinition = activeStagePosition ? activeStagePosition : from.getBoundingClientRect();
  const toDefinition = to.getBoundingClientRect();

  // 使用缓动函数计算过渡位置
  const x = easeInOutQuad(elapsed, fromDefinition.x, toDefinition.x - fromDefinition.x, duration);
  const y = easeInOutQuad(elapsed, fromDefinition.y, toDefinition.y - fromDefinition.y, duration);
  const width = easeInOutQuad(elapsed, fromDefinition.width, toDefinition.width - fromDefinition.width, duration);
  const height = easeInOutQuad(elapsed, fromDefinition.height, toDefinition.height - fromDefinition.height, duration);

  activeStagePosition = {
    x,
    y,
    width,
    height,
  };

  // 渲染遮罩层并更新状态
  renderOverlay(activeStagePosition);
  setState("__activeStagePosition", activeStagePosition);
}

// 跟踪激活元素的位置
export function trackActiveElement(element) {
  if (!element) {
    return;
  }

  const definition = element.getBoundingClientRect();

  const activeStagePosition = {
    x: definition.x,
    y: definition.y,
    width: definition.width,
    height: definition.height,
  };

  setState("__activeStagePosition", activeStagePosition);

  renderOverlay(activeStagePosition);
}

// 刷新遮罩层显示
export function refreshOverlay() {
  const activeStagePosition = getState("__activeStagePosition");
  const overlaySvg = getState("__overlaySvg");

  if (!activeStagePosition) {
    return;
  }

  if (!overlaySvg) {
    console.warn("未找到遮罩层SVG元素");
    return;
  }

  // 更新SVG的视口以匹配窗口大小
  const windowX = window.innerWidth;
  const windowY = window.innerHeight;

  overlaySvg.setAttribute("viewBox", `0 0 ${windowX} ${windowY}`);
}


// 挂载遮罩层
export function mountOverlay(stagePosition) {
  const overlaySvg = createOverlaySvg(stagePosition);
  document.body.appendChild(overlaySvg);

  // 为遮罩层添加点击事件监听
  onDriverClick(overlaySvg, e => {
    const target = e.target;
    if (target.tagName !== "path") {
      return;
    }

    emit("overlayClick");
  });

  setState("__overlaySvg", overlaySvg);
}


// 渲染遮罩层
export function renderOverlay(stagePosition) {
  const overlaySvg = getState("__overlaySvg");

  // 如果元素不可见，取消渲染
  if (!overlaySvg) {
    mountOverlay(stagePosition);

    return;
  }

  const pathElement = overlaySvg.firstElementChild;
  if (pathElement?.tagName !== "path") {
    throw new Error("在遮罩层SVG中未找到路径元素");
  }

  // 更新路径数据以匹配新的舞台位置
  pathElement.setAttribute("d", generateStageSvgPathString(stagePosition));
}


// 创建遮罩层SVG元素
export function createOverlaySvg(stage) {
  const windowX = window.innerWidth;
  const windowY = window.innerHeight;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("driver-overlay", "driver-overlay-animated");

  // 设置SVG属性
  svg.setAttribute("viewBox", `0 0 ${windowX} ${windowY}`);
  svg.setAttribute("xmlSpace", "preserve");
  svg.setAttribute("xmlnsXlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute("version", "1.1");
  svg.setAttribute("preserveAspectRatio", "xMinYMin slice");

  // 设置SVG样式
  svg.style.fillRule = "evenodd";
  svg.style.clipRule = "evenodd";
  svg.style.strokeLinejoin = "round";
  svg.style.strokeMiterlimit = "2";
  svg.style.zIndex = "10000";
  svg.style.position = "fixed";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";

  // 创建路径元素
  const stagePath = document.createElementNS("http://www.w3.org/2000/svg", "path");

  stagePath.setAttribute("d", generateStageSvgPathString(stage));

  // 设置路径样式
  stagePath.style.fill = getConfig("overlayColor") || "rgb(0,0,0)";
  stagePath.style.opacity = `${getConfig("overlayOpacity")}`;
  stagePath.style.pointerEvents = "auto";
  stagePath.style.cursor = "auto";

  svg.appendChild(stagePath);

  return svg;
}

// 生成舞台SVG路径字符串
export function generateStageSvgPathString(stage) {
  const windowX = window.innerWidth;
  const windowY = window.innerHeight;

  const stagePadding = getConfig("stagePadding") || 0;
  const stageRadius = getConfig("stageRadius") || 0;

  // 计算带内边距的舞台尺寸
  const stageWidth = stage.width + stagePadding * 2;
  const stageHeight = stage.height + stagePadding * 2;

  // 防止舞台太小导致圆角显示异常
  const limitedRadius = Math.min(stageRadius, stageWidth / 2, stageHeight / 2);

  // 确保半径不小于0且向下取整
  const normalizedRadius = Math.floor(Math.max(limitedRadius, 0));

  // 计算高亮框的位置和尺寸
  const highlightBoxX = stage.x - stagePadding + normalizedRadius;
  const highlightBoxY = stage.y - stagePadding;
  const highlightBoxWidth = stageWidth - normalizedRadius * 2;
  const highlightBoxHeight = stageHeight - normalizedRadius * 2;

  // 生成SVG路径字符串
  // M: 移动到起点，L: 画直线，Z: 闭合路径
  // a: 画椭圆弧，h: 水平线，v: 垂直线
  return `M${windowX},0L0,0L0,${windowY}L${windowX},${windowY}L${windowX},0Z
    M${highlightBoxX},${highlightBoxY} h${highlightBoxWidth} a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},${normalizedRadius} v${highlightBoxHeight} a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},${normalizedRadius} h-${highlightBoxWidth} a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},-${normalizedRadius} v-${highlightBoxHeight} a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},-${normalizedRadius} z`;
}

// 销毁遮罩层
export function destroyOverlay() {
  const overlaySvg = getState("__overlaySvg");
  if (overlaySvg) {
    overlaySvg.remove();
  }
}