let registeredListeners = {};

export function listen(hook, callback) {
  registeredListeners[hook] = callback;
}

export function emit(hook) {
  registeredListeners[hook]?.();
}

export function destroyEmitter() {
  registeredListeners = {};
}