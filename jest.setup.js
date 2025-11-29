import '@testing-library/jest-dom';

// Mock localStorage and sessionStorage for tests
const mockStorage = {
  data: new Map(),
  setItem(key, value) {
    this.data.set(key, value);
  },
  getItem(key) {
    return this.data.get(key) || null;
  },
  removeItem(key) {
    this.data.delete(key);
  },
  clear() {
    this.data.clear();
  }
};

// Setup global window object for testing
/* global global */
global.window = {
  localStorage: mockStorage,
  sessionStorage: mockStorage
};

global.localStorage = mockStorage;
global.sessionStorage = mockStorage;