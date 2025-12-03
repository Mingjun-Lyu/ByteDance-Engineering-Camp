let currentConfig = {};
let currentDriver;

export function configure(config = {}) {
  currentConfig = {
    animate: true,
    allowClose: true,
    overlayClickBehavior: "close",
    overlayOpacity: 0.7,
    smoothScroll: false,
    disableActiveInteraction: false,
    showProgress: false,
    stagePadding: 10,
    stageRadius: 5,
    popoverOffset: 10,
    showButtons: ["next", "previous", "close"],
    disableButtons: [],
    overlayColor: "#000",
    ...config,
  };
}

export function getConfig(key) {
  return key ? currentConfig[key] : currentConfig;
}

export function setCurrentDriver(driver) {
  currentDriver = driver;
}

export function getCurrentDriver() {
  return currentDriver;
}