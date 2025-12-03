// 全局配置对象，存储所有配置参数
let currentConfig = {};

// 当前驱动实例，用于跨模块访问当前引导实例
let currentDriver;

// 配置引导系统参数
export function configure(config = {}) {
  currentConfig = {
    // 是否启用动画效果
    animate: true,
    
    // 是否允许关闭引导
    allowClose: true,
    
    // 遮罩层点击行为：'close'（关闭引导）或 'next'（下一步）
    overlayClickBehavior: "close",
    
    // 遮罩层透明度（0-1）
    overlayOpacity: 0.7,
    
    // 是否启用平滑滚动
    smoothScroll: false,
    
    // 是否禁用与激活元素的交互
    disableActiveInteraction: false,
    
    // 是否显示进度指示器
    showProgress: false,
    
    // 高亮区域的内边距（像素）
    stagePadding: 10,
    
    // 高亮区域的圆角半径（像素）
    stageRadius: 5,
    
    // 弹出框与目标元素的偏移距离（像素）
    popoverOffset: 10,
    
    // 显示哪些按钮：'next'（下一步）、'previous'（上一步）、'close'（关闭）
    showButtons: ["next", "previous", "close"],
    
    // 禁用哪些按钮：'next'、'previous'、'close'
    disableButtons: [],
    
    // 遮罩层颜色
    overlayColor: "#000",
    
    // 合并用户自定义配置
    ...config,
  };
}

// 获取配置参数
export function getConfig(key) {
  return key ? currentConfig[key] : currentConfig;
}

// 设置当前驱动实例
export function setCurrentDriver(driver) {
  currentDriver = driver;
}

// 获取当前驱动实例
export function getCurrentDriver() {
  return currentDriver;
}